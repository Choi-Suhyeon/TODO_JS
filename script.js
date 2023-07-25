Date.prototype.dayStr      = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
Date.prototype.toStrFormat = function () {
    const concat0  = num => (num > 9 ? '' : '0') + num;
          month    = concat0(this.getMonth() + 1),
          date     = concat0(this.getDate());
          day      = this.dayStr[this.getDay()];

    return `${this.getFullYear()}-${month}-${date} (${day})`;
};
Date.prototype.isSameDate  = function (date) {
    return true
        && this.getFullYear() === date.getFullYear()
        && this.getMonth() === date.getMonth()
        && this.getDate() === date.getDate();
};

const TodoList = class {
    #todoArr;

    constructor() {
        this.#todoArr = this.#loadFromSessionStorage();

        this.#sortTable();
    }

    #saveToSessionStorage() {
        sessionStorage.setItem('todo-data', JSON.stringify(this.#todoArr));
    }

    #loadFromSessionStorage() {
        return JSON.parse(sessionStorage.getItem('todo-data')) ?? [];
    }

    #sortTable() {
        this.#todoArr.sort((a, b) =>
            a.done && !b.done ? 1  :
            !a.done && b.done ? -1 :
            a.deadLineNum - b.deadLineNum
        );

        const tbody = document.getElementById('todos').getElementsByTagName('tbody')[0];

        Object.values(tbody.getElementsByTagName('tr')).forEach(tr => {
            tbody.removeChild(tr);
        });

        this.#todoArr.forEach(({task, deadLineNum, hash, done}) => {
            const row      = tbody.insertRow(),
                  today    = new Date(),
                  deadLine = new Date(deadLineNum);

            row.insertCell(0).innerHTML = `<input id="elem-${hash}" onclick="todoList.checkDone(this);" type="checkbox" ${done ? "checked" : ""}>`;
            row.insertCell(1).innerHTML = `<div${done ? ' class="text-secondary"' : ''}>${task}</div>`;
            row.insertCell(2).innerHTML = `<div${done ? ' class="text-secondary"' : ''}>${deadLine.toStrFormat()}</div>`;

            if (today.isSameDate(deadLine) && !done) {
                row.className = "table-warning";
            }
            else if (today > deadLine && !done) {
                row.className = "table-danger";
            }
        });
    }

    applyNewElem(form) {
        const task     = form[0].value,
              deadLine = (new Date(form[1].value || null)).getTime();

        if (!task || deadLine === (new Date(null)).getTime()) {
            return false;
        }

        this.#todoArr.push({
            task:        task,
            deadLineNum: deadLine,
            hash:        CryptoJS.SHA256(task + deadLine).toString(), 
            done:        false,
        });

        this.#sortTable();
        this.#saveToSessionStorage();
        
        return false;
    }

    checkDone(elem) {
        const hash = elem.id.split('-')[1],
              idx  = this.#todoArr.findIndex(elem => elem.hash === hash);

        this.#todoArr[idx].done = !this.#todoArr[idx].done;

        this.#sortTable();
        this.#saveToSessionStorage();
    }

    delElemDone() {
        this.#todoArr = this.#todoArr.filter(elem => !elem.done);

        this.#sortTable();
        this.#saveToSessionStorage();
    }
};

const todoList = new TodoList();