import {X} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {hideError, selectError} from "../redux/error.slice.ts";

function ErrorMessagePopup() {
    const dispatch = useDispatch();
    const errorMessage = useSelector(selectError);

    return <> {
        errorMessage.visible ?
            <div
                className="z-50 fixed flex-row top-0 right-0 p-5 m-5 border-accent bg-input-background rounded-md border border-border">
                <span className="block w-full text-primary">{errorMessage.title}: </span>
                <span className="block w-full">{errorMessage.message}</span>
                <span className="absolute top-0 right-0 p-2"><X
                    onClick={() => dispatch(hideError())} className="h-5 w-5"/></span>
            </div>
            :
            <></>
    }</>
}

export default ErrorMessagePopup;