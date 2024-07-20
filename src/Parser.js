export default function parse(text) {

    if (!text.includes("[BEAR-ARCH] [TRACING MOCK]")) {
        return { error: "Log must contain the following value: [BEAR-ARCH] [TRACING MOCK]" }
    }
    const result = {}

    if (text.includes("[TRACING MOCK]: [API REQUEST]")) {
        result.request = parseContent(text, true);
    }

    if (text.includes("[TRACING MOCK]: [API RESPONSE]")) {
        result.response = parseContent(text, false);
    }

    if (text.includes("[TRACING MOCK]: [REST CONNECTOR]")) {
        result.request = parseContent(text.substring(0, text.indexOf("[RESPONSE]")), true);
        result.response = parseContent(text.substring(text.indexOf("[RESPONSE]")), false);
    }

    return result;
}


function parseContent(textRequest, computeCurl) {

    try {

        let request = {};

        //REQUEST ID
        if (textRequest.includes("- RequestId")) {
            let requestId = textRequest.substring(textRequest.indexOf("- RequestId"));
            console.log(requestId)
            requestId = requestId.substring(13, requestId.indexOf(" - "));
            request.requestId = requestId;
        }

        //Method
        const methodMatch = "Method: ";
        if (textRequest.includes(methodMatch)) {
            let method = textRequest.substring(textRequest.indexOf(methodMatch) + methodMatch.length);
            method = method.substring(0, method.indexOf(" - "));
            request.method = method;
        }

        //URI
        if (textRequest.includes("URI")) {
            let uri = textRequest.substring(textRequest.indexOf("URI") + 5);
            uri = uri.substring(0, uri.indexOf(" - "));
            request.uri = uri;
        }

        // PARAMS
        const paramsMatch = "Params: ";
        let params = textRequest.substring(textRequest.indexOf(paramsMatch));
        params = params.substring(params.indexOf("{"), params.indexOf("- Headers:"));
        params = params.substring(params.indexOf("{") + 1, params.lastIndexOf("}"));

        const paramsMap = {};
        params.replaceAll("], ", "]---").split("---").forEach((params) => {
            const key = params.substring(0, params.indexOf("="));
            paramsMap[key] = params.substring(params.indexOf("[") + 1, params.lastIndexOf("]"));
        });

        request.params = paramsMap;

        //HEADERS
        let headers = textRequest.substring(textRequest.indexOf("Headers"));
        headers = headers.substring(headers.indexOf("{"), headers.indexOf("- Body:"));
        headers = headers.substring(headers.indexOf("{") + 1, headers.lastIndexOf("}"));

        const headerMap = {};
        headers.replaceAll("], ", "]---").split("---").forEach((header) => {
            const key = header.substring(0, header.indexOf("="));
            headerMap[key] = header.substring(header.indexOf("[") + 1, header.lastIndexOf("]"));
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

        if (computeCurl) {
            request.curl = getCurl(request);
        }

        return request;
    } catch (e) {
        return { error: e }
    }
}

function getCurl(request) {

    if (!request.method || !request.uri) {
        return "";
    }

    const excludedHeaders = ["x-real-ip", "x-forwarded-for", "x-forwarded-host",
        "x-forwarded-port", "x-forwarded-proto", "user-agent",
        "x-dynatrace-application", "x-dynatrace-requeststate", "x-dynatrace",
        "traceparent", "tracestate", "x-ruxit-forwarded-for", "host", "forwarded", "postman-token"
    ];
    const spaceBackSlashNewLine = " \\\n";

    // method
    let curl = `curl --request ${request.method}`;

    // params
    let uri = request.uri;
    if (!isEmpty(request.params)) {
        uri += `?`;
        let isFirst = true;
        for (let key in request.params) {
            if (request.params.hasOwnProperty(key)) {
                if (!isFirst) {
                    uri += `&`;
                }
                uri += `${key}=${encodeURIComponent(request.params[key])}`;
                isFirst = false;
            }
        }
    }

    // uri
    if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
        curl += `${spaceBackSlashNewLine}--location '${uri}'`;
    } else {
        if (request.headers.hasOwnProperty("x-forwarded-host") && request.headers.hasOwnProperty("x-forwarded-proto")) {
            let host = request.headers["x-forwarded-host"].split(',')[0].trim();
            let protocol = request.headers["x-forwarded-proto"].split(',')[0].trim();
            curl += `${spaceBackSlashNewLine}--location '${protocol}://${host}${uri}'`;
        } else {
            curl += `${spaceBackSlashNewLine}--location 'NEEDED-MANUAL-EDIT${uri}'`;
        }
    }


    // headers
    if (!isEmpty(request.headers)) {
        for (let key in request.headers) {
            if (request.headers.hasOwnProperty(key) && !excludedHeaders.includes(key)) {
                curl += `${spaceBackSlashNewLine}--header '${key}: ${request.headers[key]}'`;
            }
        }
    }

    // body
    if (!isEmpty(request.body)) {
        curl += `--data '${JSON.stringify(request.body)}'`;
    }

    return curl;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}