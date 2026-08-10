const API =
    "https://codementor-ai-kfkz.onrender.com/conversation";


function getToken() {

    return localStorage.getItem(
        "codementor_token"
    );

}


async function request(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Content-Type":
                "application/json",

            Authorization:
                `Bearer ${getToken()}`,

            ...(options.headers || {})

        }

    });


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Request failed"
        );

    }


    return data;

}


// ================= Save =================

export async function saveConversationToDB(data) {

    return request(
        `${API}/save`,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );

}


// ================= History =================

export async function getHistoryFromDB(tool = "") {

    const url = tool
        ? `${API}/history?tool=${encodeURIComponent(tool)}`
        : `${API}/history`;


    return request(url);

}


// ================= Get One =================

export async function getConversationFromDB(id) {

    return request(
        `${API}/${id}`
    );

}


// ================= Delete One =================

export async function deleteConversationFromDB(id) {

    return request(
        `${API}/${id}`,
        {
            method: "DELETE"
        }
    );

}


// ================= Clear All =================

export async function clearHistoryFromDB() {

    return request(
        `${API}/clear`,
        {
            method: "DELETE"
        }
    );

}
