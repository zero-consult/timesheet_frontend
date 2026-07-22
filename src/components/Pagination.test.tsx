import {expect, test} from "vitest";
import {render} from "@testing-library/react";
import Pagination from "./Pagination.tsx";

test('Simpel render', async () => {
    const renderResult = render(<Pagination page={0} total={20} onChange={() => {}}/>);
    expect(renderResult).toMatchSnapshot();
})