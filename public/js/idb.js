let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_expense', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        // uploadExpense();
    }
    // alert('Transaction successfully added!')
};

request.onerror = function (event) {

    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_expense'], 'readwrite');

    const expenseObjectStore = transaction.objectStore('new_expense');

    expenseObjectStore.add(record);

    alert('Value successfully received. Transaction will be saved online once connection is restablished.');

}

function uploadExpense() {
    const transaction = db.transaction(['new_expense'], 'readwrite');

    const expenseObjectStore = transaction.objectStore('new_expense');

    const getAll = expenseObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_expense'], 'readwrite');

                    const expenseObjectStore = transaction.objectStore('new_expense');

                    expenseObjectStore.clear();

                    alert('Transaction successfully added!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', uploadExpense);
