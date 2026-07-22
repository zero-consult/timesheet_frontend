import {expect} from "vitest";
import {fireEvent, type RenderResult} from "@testing-library/react";

export async function changeInputValue(renderResult: RenderResult, label: string, value: string) {
    const renderedLabel = await renderResult.findByText(label);
    expect(renderedLabel.parentNode).not.toBeNull();
    const renderedInput = renderedLabel.parentNode!.querySelector('input');
    expect(renderedInput).not.toBeNull();
    fireEvent.change(renderedInput!, {target: {value: value}})
}

export async function changeTextAreaValue(renderResult: RenderResult, label: string, value: string) {
    const renderedLabel = await renderResult.findByText(label);
    expect(renderedLabel.parentNode).not.toBeNull();
    const renderedTextArea = renderedLabel.parentNode!.querySelector('textarea');
    expect(renderedTextArea).not.toBeNull();
    fireEvent.change(renderedTextArea!, {target: {value: value}})
}

export async function changeSelectValue(renderResult: RenderResult, label: string, value: string) {
    const renderedLabel = await renderResult.findByText(label);
    expect(renderedLabel.parentNode).not.toBeNull();
    const renderedSelect = renderedLabel.parentNode!.querySelector('select');
    expect(renderedSelect).not.toBeNull();
    fireEvent.change(renderedSelect!, {target: {value: value}})
}