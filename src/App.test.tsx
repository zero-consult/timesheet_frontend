import { render, screen } from '@testing-library/react';
import App from './App';
import {expect, type MockedFunction, test, vi} from "vitest";
import axios from "axios";
import type {Employee} from "./types/people";
import {Provider} from "react-redux";
import store from "./redux/store.ts";
import {login} from "./redux/account.slice.ts";
import {EMP_1} from "./testutils/testData.ts";

vi.mock('axios', () => {
    return {
        default: {
            defaults: { baseURL: 'http://localhost:8080'},
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

test('renders empty page with menu', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        { data: [] as Employee[]}
    )
    store.store.dispatch(login({user: EMP_1, admin: true, token: 'Test'}))
    render(<Provider store={store.store}><App /></Provider>);
    const linkElement = await screen.findAllByText("menu.timesheets");
    expect(linkElement.length).toEqual(1);
});