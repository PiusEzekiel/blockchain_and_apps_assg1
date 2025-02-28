import { Helmet } from "react-helmet";

const SecurityHeaders = () => (
    <Helmet>
        <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'nonce-random123'; style-src 'self' 'unsafe-inline';"
        />
    </Helmet>
);

export default SecurityHeaders;
