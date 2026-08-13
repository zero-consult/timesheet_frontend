import {expect, type MockedFunction, test, vi} from "vitest";
import axios from "axios";
import {fireEvent, render, type RenderResult, waitFor} from "@testing-library/react";
import Timesheetlist from "./Timesheetlist.tsx";
import store from "../redux/store.ts";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router";
import {CUST_1, EMP_1, TS_ENTRY_1} from "../testutils/testData.ts";
import type {TimesheetEntry} from "../types/timesheet";
import type {Customer, Employee} from "../types/people";

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal<typeof import('axios')>();

    return {
        ...actual,
        default: {
            defaults: {baseURL: 'http://localhost:8080'},
            post: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            put: vi.fn(),
            create: vi.fn().mockReturnThis(),
            request: vi.fn(),
            interceptors: {
                request: {
                    use: vi.fn(),
                    eject: vi.fn(),
                },
                response: {
                    use: vi.fn(),
                    eject: vi.fn(),
                },
            },
        },
    };
});

vi.mock('react-i18next', async (importOriginal) => {

    const actual = await importOriginal<typeof import('react-i18next')>();

    return {
        ...actual,
        useTranslation: () => {
            return {
                t: vi.fn((key) => key),
                i18n: {
                    resolvedLanguage: 'en',
                    changeLanguage: vi.fn(),
                }
            }
        },
    }
});

vi.mock('moment', async () => {
    const actual = await vi.importActual('moment');
    return {
        ...actual,
        // @ts-expect-error default exists
        default: vi.fn((input) => typeof input !== "undefined" ? actual.default(input) : actual.default('2026-07-20T12:00:00.000Z'))
    };
});

async function waitForDataToBeLoaded(renderResult: RenderResult) {
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("John Doe");
        expect(tableItem.length).toEqual(2);
    }, {timeout: 3000})
}

test('renders empty timesheet list', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("timesheetlist.table.empty");
        expect(tableItem.length).toEqual(1);
    }, {timeout: 3000})
    expect(renderResult).toMatchSnapshot();
})

test('renders timesheet list', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);
    expect(renderResult).toMatchSnapshot();
});

test('can search timesheets', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);

    await waitForDataToBeLoaded(renderResult);

    const querySelector = renderResult.container.querySelector('#search');
    expect(querySelector).not.toBeNull()
    if (querySelector !== null) {
        fireEvent.change(querySelector, {target: {value: 'John'}})
        const findByText = await renderResult.findAllByText("John Doe");
        expect(findByText.length).toEqual(2);
        fireEvent.change(querySelector, {target: {value: 'foe'}})
        const allByText = renderResult.getAllByText("John Doe");
        expect(allByText.length).toEqual(1);
    }
})

test('filter on status', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )

    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    expect(renderResult.getAllByText("John Doe").length).toEqual(2);
    const filterButton = await renderResult.getByText('timesheetlist.status.rejected');
    fireEvent.click(filterButton);
    expect(renderResult.getAllByText("John Doe").length).toEqual(1);
})

test('sort on customer', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1, {...CUST_1, id: '2', contactPersonFirstName: 'John'}] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1, {...TS_ENTRY_1, id: '2', customerId: '2'}] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("John Doe");
        expect(tableItem.length).toEqual(3);
    });

    const customerHeader = await renderResult.findByText('timesheetlist.table_headers.customer');
    fireEvent.click(customerHeader);
    expect(renderResult).toMatchSnapshot();
    fireEvent.click(customerHeader);
    expect(renderResult).toMatchSnapshot();
})

test('sort on employee', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1, {...EMP_1, id: '2', firstName: 'Jane'}] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1, {...TS_ENTRY_1, id: '2', employeeId: '2'}] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    waitForDataToBeLoaded(renderResult)

    const customerHeader = await renderResult.findByText('timesheetlist.table_headers.employee');
    fireEvent.click(customerHeader);
    expect(renderResult).toMatchSnapshot();
    fireEvent.click(customerHeader);
    expect(renderResult).toMatchSnapshot();
})


test('delete timesheet entry', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const deleteButton = renderResult.container.querySelector("#delete-1");
    expect(deleteButton).not.toBeNull();
    fireEvent.click(deleteButton!);
    expect(renderResult).toMatchSnapshot();
})

test('approve timesheet entry', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const approveButton = renderResult.container.querySelector("#approve-1");
    expect(approveButton).not.toBeNull();
    fireEvent.click(approveButton!);
    expect(renderResult).toMatchSnapshot();
})

test('reject timesheet entry', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [TS_ENTRY_1] as TimesheetEntry[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><Timesheetlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const approveButton = renderResult.container.querySelector("#reject-1");
    expect(approveButton).not.toBeNull();
    fireEvent.click(approveButton!);
    expect(renderResult).toMatchSnapshot();
})