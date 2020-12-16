import {sleep, check} from "k6";
import http from "k6/http";
import {Counter} from "k6/metrics";

import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
    stages: [
        {
            duration: "12s",
            target: 10
        }, {
            duration: "36s",
            target: 10
        }, {
            duration: "12s",
            target: 0
        }
    ],
    thresholds: {
        "http_req_duration": ["p(95)<500"],
        "requests": ["count < 100"],
        "myCounter": ["count > 10000"]
    },
    ext: {
        loadimpact: {
            projectID: 3113635,
            name: "Azure Pipelines Test",
            distribution: {
                "Ashburn - US": {
                    loadZone: "amazon:us:ashburn",
                    percent: 50
                },
                "Sydney - AU": {
                    loadZone: "amazon:au:sydney",
                    percent: 50
                }
            }
        }
    }
};
//let someMetric = new Counter("myCounter");
let someValue = __ENV.NUMBER;

export default function () {
    let response;

    //someMetric.add(someValue);

    const vars = {};

    response = http.get("https://test-api.loadimpact.com/public/crocodiles/");
    check(response, {
        "status equals 200": response => response
            .status
            .toString() === "200"
    });
    console.log(response.body);

    response = http.post("https://test-api.loadimpact.com/auth/token/login/", '{"username":"mark","password":"securepassword1"}', {
        headers: {
            "Content-Type": "application/json"
        }
    });
    vars["token"] = jsonpath.query(response.json(), "$.access")[0];
    console.log(response.status);

    // my crocs
    response = http.get("https://test-api.loadimpact.com/my/crocodiles/", {
        headers: {
            Authorization: `Bearer ${vars["token"]}`,
            'api-key': "something"
        }
    });
    check(response, {
        "$[0].name equals Jerry": response => {
            const values = jsonpath.query(response.json(), "$[0].name");
            return !!values.find(value => value === "Jerry");
        }
    });
    console.log(response.body);

    sleep(1);
}
