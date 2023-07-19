let todoArr;

Date.prototype.dayStr      = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
Date.prototype.toStrFormat = function () {
    const concat0  = (num) => (num > 9 ? '' : '0') + num;
          month    = concat0(this.getMonth() + 1),
          date     = concat0(this.getDate());
          day      = this.dayStr[this.getDay()];

    return `${this.getFullYear()}-${month}-${date} (${day})`;
}
Date.prototype.isSameDate  = function (date) {
    return true
        && this.getFullYear() === date.getFullYear()
        && this.getMonth() === date.getMonth()
        && this.getDate() === date.getDate();
}

const saveToSessionStorage = function (obj) {
    sessionStorage.setItem('todo-data', JSON.stringify(obj));
}

const loadFromSessionStorage = function () {
    return JSON.parse(sessionStorage.getItem('todo-data')) ?? [];
}

const reflectElement = function (form) {
    const task     = form[0].value,
          deadLine = (new Date(form[1].value || null)).getTime();

    if (!task || deadLine === (new Date(null)).getTime()) {
        return false;
    }

    todoArr.push({
        task:        task,
        deadLineNum: deadLine,
        hash:        CryptoJS.SHA256(task + deadLine).toString(), 
        done:        false,
    });
    sortTable();
    saveToSessionStorage(todoArr);
    
    return false;
};

const checkDone = function (elem) {
    const hash = elem.id.split('-')[1],
          idx  = todoArr.findIndex((e) => e.hash === hash);

    todoArr[idx].done = !todoArr[idx].done;

    sortTable();
    saveToSessionStorage(todoArr);
};

const sortTable = function () {
    todoArr = todoArr.sort((a, b) => {
        return a.done && !b.done ? 1  :
               !a.done && b.done ? -1 :
               a.deadLine - b.deadLine;
    });

    const tbody = document.getElementById('todos').getElementsByTagName('tbody')[0];

    Object.values(tbody.getElementsByTagName('tr')).forEach((tr) => {
        tbody.removeChild(tr);
    });

    todoArr.forEach(({task, deadLineNum, hash, done}) => {
        const row   = tbody.insertRow(),
              today = new Date(),
              deadLine = new Date(deadLineNum);

        row.insertCell(0).innerHTML = `<input id="elem-${hash}" onclick="checkDone(this);" type="checkbox" ${done ? "checked" : ""}>`;
        row.insertCell(1).innerHTML = `<div${done ? ' class="text-secondary"' : ''}>${task}</div>`;
        row.insertCell(2).innerHTML = `<div${done ? ' class="text-secondary"' : ''}>${deadLine.toStrFormat()}</div>`;

        if (today.isSameDate(deadLine) && !done) {
            row.className = "table-warning";
        }
        else if (today > deadLine && !done) {
            row.className = "table-danger";
        }
    });
};

todoArr = loadFromSessionStorage();
sortTable();