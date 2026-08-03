import {expect, type MockedFunction, test, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import store from "../redux/store.ts";
import {BrowserRouter, useParams} from "react-router";
import axios from "axios";
import {CUST_1, EMP_1, TS_ENTRY_1} from "../testutils/testData.ts";
import {selectSelectedTimesheetEntry} from "../redux/timesheet.slice.ts";
import ErrorMessagePopup from "../components/ErrorMessagePopup.tsx";
import {changeInputValue, changeSelectValue, changeTextAreaValue} from "../testutils/testUtils.ts";
import SingleTimesheetEntry from "./SingleTimesheetEntry.tsx";
import type {TimesheetEntry} from "../types/timesheet";
import type {Customer, Employee} from "../types/people";

vi.mock('moment', async () => {
    const actual = await vi.importActual('moment');
    return {
        ...actual,
        // @ts-expect-error default exists
        default: vi.fn((input) => typeof input !== "undefined" ? actual.default(input) : actual.default('2026-07-20T12:00:00.000Z'))
    };
});

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

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useParams: vi.fn(() => ({timesheetId: undefined}))
    }
});

test('render single timesheet page', async () => {
    const renderResult = render(<Provider
        store={store}><BrowserRouter><SingleTimesheetEntry/></BrowserRouter></Provider>);
    expect(renderResult).toMatchSnapshot();
})

test('change form values', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1, {...EMP_1, firstName: 'Jef', id: '2'}] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1, {...CUST_1, id: '2', contactPersonFirstName: 'Mike'}] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce({data: "2026-06-01"})
    const renderResult = render(<Provider
        store={store}><BrowserRouter><SingleTimesheetEntry/></BrowserRouter></Provider>);
    await changeSelectValue(renderResult, 'single_timesheet_entry.labels.employee *', '2');
    let selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    expect(selectedTimesheetEntry.employeeId).toBe('2')
    expect(() => {
        renderResult.getByText('single_timesheet_entry.save')
    }).toThrow()
    fireEvent.click(renderResult.getByText('single_timesheet_entry.weekday.mo'));
    await changeInputValue(renderResult, 'single_timesheet_entry.labels.start_time *', '09:30');
    selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    expect(selectedTimesheetEntry.startTime).toBe('09:30')
    await changeInputValue(renderResult, 'single_timesheet_entry.labels.end_time *', '17:30');
    selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    expect(selectedTimesheetEntry.endTime).toBe('17:30')
    await changeSelectValue(renderResult, 'single_timesheet_entry.labels.customer *', '2');
    selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    expect(selectedTimesheetEntry.customerId).toBe('2')
    await changeTextAreaValue(renderResult, 'single_timesheet_entry.labels.description', 'some description');
    selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    expect(selectedTimesheetEntry.description).toBe('some description')
    expect(renderResult.getByText('single_timesheet_entry.save')).not.toBeNull();
}, 50000)

test('Save timesheet', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )

    const renderResult = render(<Provider
        store={store}><BrowserRouter><ErrorMessagePopup/><SingleTimesheetEntry/></BrowserRouter></Provider>);

    fireEvent.click(renderResult.getByText('single_timesheet_entry.weekday.mo'));
    fireEvent.click(renderResult.getByText('single_timesheet_entry.weekday.tu'));

    let saveButton = await renderResult.findByText('single_timesheet_entry.save');

    await changeInputValue(renderResult, 'single_timesheet_entry.labels.start_time *', '');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_timesheet_entry.input.error.start_time_required'))
    await changeInputValue(renderResult, 'single_timesheet_entry.labels.start_time *', '09:30');
    await changeInputValue(renderResult, 'single_timesheet_entry.labels.end_time *', '17:30');

    const selectedTimesheetEntry = selectSelectedTimesheetEntry(store.getState());
    axiosCalls.mockReset();
    axiosCalls.mockResolvedValueOnce(({
        data: {...selectedTimesheetEntry, id: '1'}
    }))
    axiosCalls.mockResolvedValueOnce(({
        data: {...selectedTimesheetEntry, id: '2'}
    }))
    saveButton = await renderResult.findByText('single_timesheet_entry.save');
    fireEvent.click(saveButton);
    await waitFor(async () => {
        expect(axiosCalls).toHaveBeenCalledTimes(2)
    })
})

test('Edit timesheet', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: [CUST_1] as Customer[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: TS_ENTRY_1 as TimesheetEntry}
    )
    const useParamsCalls = useParams as MockedFunction<typeof useParams>;
    useParamsCalls.mockReturnValue({timesheetEntryId: '1'})
    const renderResult = render(<Provider
        store={store}><BrowserRouter><ErrorMessagePopup/><SingleTimesheetEntry/></BrowserRouter></Provider>);
    const saveButton = await renderResult.findByText('single_timesheet_entry.save');

    const selectedTimesheet = selectSelectedTimesheetEntry(store.getState());
    axiosCalls.mockResolvedValueOnce(({
        data: selectedTimesheet
    }))
    fireEvent.click(saveButton);
})