// ChatGPT (free version) proofread and assisted

class Client {
    constructor (server2URL) {
        this.server2URL = server2URL;

        this.insertBtn = document.getElementById("insertBtn");
        this.queryBtn = document.getElementById("queryBtn");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.output = document.getElementById("output");

        this.handleEvents();
    }

    handleEvents() {
        this.insertBtn.addEventListener("click", () => {
            this.insertData();
        });

        this.queryBtn.addEventListener("click", () => {
            this.queryData();
        });
    }

    // ChatGPT (free version) used for assistance
    async insertData() {
        this.output.textContent = STRINGS.INSERT_REQUEST;

        try {
            const res = await fetch (
                `${this.server2URL}/insert`,
                { method: "POST" }
            );

            const result = await res.text();
            this.output.textContent = result;
        } catch (error) {
            this.output.textContent = STRINGS.INSERT_ERROR + error.message;
        }
    }

    // ChatGPT (free version) used for assistance
    async queryData() {
        const sql = this.sqlQuery.value.trim();

        if (sql.length === 0) {
            this.output.textContent = STRINGS.DEFAULT_OUTPUT;
            return;
        }

        this.output.textContent = STRINGS.RUNNING_QUERY;

        try {
            const encodedSql = encodeURIComponent(sql);
            const res = await fetch (
                `${this.server2URL}/api/v1/sql/${encodedSql}`,
                { method: "GET" }
            );

            const result = await res.text();
            this.output.textContent = result;
        } catch (error) {
            this.output.textContent = STRINGS.QUERY_ERROR + error.message;
        }
    }
}

class UserInterface {
    constructor () {
        this.title = document.getElementById("title");
        this.insertBtn = document.getElementById("insertBtn");
        
        this.headerGetData = document.getElementById("headerGetData");
        this.labelQuery = document.getElementById("labelQuery");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.queryBtn = document.getElementById("queryBtn");
        
        this.headerResult = document.getElementById("headerResult");
        this.output = document.getElementById("output");

        this.showUserFacingStrings();
    }

    showUserFacingStrings() {
        this.title.textContent = STRINGS.TITLE;
        this.insertBtn.textContent = STRINGS.BUTTON_INSERT;
        
        this.headerGetData.textContent = STRINGS.HEADER_GET_DATA;
        this.labelQuery.textContent = STRINGS.LABEL_QUERY;
        this.sqlQuery.placeholder = STRINGS.PLACEHOLDER_QUERY;
        this.queryBtn.textContent = STRINGS.BUTTON_QUERY;
        
        this.headerResult.textContent = STRINGS.HEADER_RESULT;
        this.output.textContent = STRINGS.DEFAULT_OUTPUT;
    }
}

new UserInterface();
const server2URL = "https://comp4537-lab4-qbhf.onrender.com";
new Client(server2URL);