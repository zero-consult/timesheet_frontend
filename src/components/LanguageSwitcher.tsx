import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import Cookies from "universal-cookie";

const languages = ["nl", "en", "fr", "jp"];

const cookies = new Cookies(null, {domain: 'localhost', path: '/'});

export type LanguageSwitcherProps = {
    compact: boolean;
};

function LanguageSwitcher(props: LanguageSwitcherProps) {
    const {i18n} = useTranslation();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        cookies.get('language') ? setLanguage(cookies.get('language')) : setLanguage("en");
    }, [])

    function setLanguage(language: string) {
        i18n.changeLanguage(language);
        cookies.set('language', language);
    }

    return <div className="px-3 py-4 border-t flex border-sidebar-border">
        {languages
            .filter((language) => !props.compact || language === i18n.resolvedLanguage)
            .map(((language) =>
                    <button
                        key={language}
                        className={"grow " + " " + (i18n.resolvedLanguage === language ? "text-primary" : "")}
                        style={{fontWeight: i18n.resolvedLanguage === language ? 'bold' : 'normal'}}
                        onClick={() => setLanguage(language)}>
                        {language}
                    </button>
            ))}
    </div>
}

export default LanguageSwitcher;