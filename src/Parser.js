export default function parse(text) {

    if (!text.includes("[BEAR-ARCH] [TRACING MOCK]")) {
        return {error: "Log must contain the following value: [BEAR-ARCH] [TRACING MOCK]"}
    }
    const result = {}

    if (text.includes("[TRACING MOCK]: [API REQUEST]")) {
        result.request = parseContent(text);
    }

    if (text.includes("[TRACING MOCK]: [API RESPONSE]")) {
        result.response = parseContent(text);
    }

    if (text.includes("[TRACING MOCK]: [REST CONNECTOR]")) {
        result.request = parseContent(text.substring(0, text.indexOf("[RESPONSE]")));
        result.response = parseContent(text.substring(text.indexOf("[RESPONSE]")));
    }

    return result;
}


function parseContent(textRequest) {

    try {

        let request = {};

        //REQUEST ID
        if (textRequest.includes("- RequestId")) {
            let requestId = textRequest.substring(textRequest.indexOf("- RequestId"));
            console.log(requestId)
            requestId = requestId.substring(13, requestId.indexOf(" - "));
            request.requestId = requestId;
        }

        //URI
        if (textRequest.includes("URI")) {
            let uri = textRequest.substring(textRequest.indexOf("URI") + 5);
            uri = uri.substring(0, uri.indexOf(" - "));
            request.uri = uri;
        }

        //HEADERS
        let headers = textRequest.substring(textRequest.indexOf("Headers"));
        headers = headers.substring(headers.indexOf("{"), headers.indexOf("- Body:"));
        headers = headers.substring(headers.indexOf("{")+1, headers.lastIndexOf("}"));

        const headerMap = {};
        headers.replaceAll("], ", "]---").split("---").forEach((header) => {
            const key = header.substring(0, header.indexOf("="));
            headerMap[key] = header.substring(header.indexOf("[")+1, header.lastIndexOf("]"));
        });

        request.headers = headerMap;

        //Body
        let body = textRequest.substring(textRequest.indexOf("- Body:"));
        if (body.includes("[Empty]")) {
            request.body = ""
        } else {
            body = body.substring(body.indexOf("{"));
            body = body.substring(0, body.lastIndexOf("}") + 1);
            request.body = JSON.parse(body);
        }

        return request;
    } catch (e) {
        return {error: e}
    }
}