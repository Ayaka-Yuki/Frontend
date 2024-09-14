/* database initialization and maxID initialization */
var database = {};
var maxID = 0;

/* loadDataBase function to load data from local storage */
function loadDataBase() {
    /* Check if the data exists in local storage */
    const data = localStorage.getItem("database");
    if (data) {
        /* Parse and use the data */
        database = JSON.parse(data);
        /* expanding arrays into individual elements and finding the maxID */
        maxID = Math.max(...Object.keys(database));
        console.log('Data loaded from local storage:', database);
        console.log('Max ID:', maxID);
    } else {
        /* Handle the case where no data is found */
        console.log('No data found in local storage.');
        /* Default data initialization */
        database = {
            1: {"title": "Grocery Shopping", "description": "Weekly grocery run at the supermarket",
                "amount": 85.50, "category": "Food & Dining", "date": "2024-08-25", "row_index": 0},
            2: {"title": "Monthly Rent", "description": "Rent payment for September",
                "amount": 1200.00, "category": "Housing", "date": "2024-09-01", "row_index": 1}
        };
        maxID = 2;
        console.log('Default Database Initialized:', database);
        console.log('Max ID:', maxID);
    };
    return 0;
};

/* known_categories object to map categories to class names */
const known_categories = {"Food & Dining":"food-dining", "Housing":"housing", "Transportation":"transportation",
    "Communication":"communication","Personal Care":"personal-care","Health and Wellness":"health-wellness",
    "Education":"education", "Entertainment":"entertainment", "Debt Payments":"debt-payments","Pets":"pets","Others":"others"};

/* Display function to render the table */
function display() {
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    for (let serial_number in database) {
        const newRow = tableBody.insertRow();
        const rowData = database[serial_number];
        newRow.insertCell().textContent = serial_number ;
        Object.entries(rowData).forEach(([key, value]) => {
            if (key == "row_index") {
                return;
            }
            const newCell = newRow.insertCell();
            if (key == "amount") {
                value = parseFloat(value).toFixed(2);
            }
            newCell.textContent = value;
            if (key == "category") {
                newRow.setAttribute("class", value in known_categories ? known_categories[value] : "others");
            }
        });
        /* add checkbox */
        const actionCell = newRow.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.id = `${serial_number}row-checkbox`;
        actionCell.appendChild(checkbox);
    }
    console.log('Default database displayed:', database);
    return 0;
};

/* Add form data to table */
function add(event){
    /* prevent form submission */
    event.preventDefault(); 
    /* retrieve form data */
    const formData = new FormData(this);
    const dataArray = Array.from(formData.entries());
    /* increment maxID and add data to new row in table */
    maxID += 1;
    const serialNumber = maxID;
    /* add data to new row in table */
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.insertCell().textContent = serialNumber;
    const data = {};
    dataArray.forEach(([key,value]) => {
        const newCell = newRow.insertCell();               
        data[key] = value;
        if (key === "amount") {
            value = parseFloat(value).toFixed(2);
        };
        newCell.textContent = value;
        /* set category as class for filter */
        if (key == "category"){
            newRow.setAttribute("class", value in known_categories ? known_categories[value] : "others");
        };
    });
    /* add checkbox */
    const actionCell = newRow.insertCell();
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'row-checkbox';
    checkbox.id = `${serialNumber}row-checkbox`;
    actionCell.appendChild(checkbox);

    /* add row index and add row data to database and log data */
    data["row_index"] = newRow.rowIndex-1;
    database[serialNumber] = data;
    console.log('Entry Added:', serialNumber, data);
    /* reset form */
    this.reset();
    return 0;
};

/* Update function */
function update(event){
    /* prevent form submission */
    event.preventDefault(); 
    /* retrieve form update entry */
    const formData = new FormData(this);
    const dataArray = Array.from(formData.entries());
    /* check if serial number is already in database */
    const serialNumber = dataArray.find(([key]) => key == 'serial_number')[1];
    if (!(serialNumber in database)) {
        alert("Serial Number not found");
        return 404;
    };
    /* update data to new row in table */
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const data = database[serialNumber];
    const updateRow = tableBody.rows[data["row_index"]];
    var i = 0;
    dataArray.forEach(([key,value]) => {
        if (key != "serial_number" && data[key] != value){   
            if (key == "amount") {
                value = parseFloat(value).toFixed(2);
            }
            /* update row class attribute if category is changed */
            if (key == "category"){
                updateRow.setAttribute("class", value in known_categories ? known_categories[value] : "others");
            }
            data[key] = value;
            updateRow.cells[i].textContent = value;
        };
        i ++;
    });
    /* record updated data and reset form */
    console.log('Entry Updated:', serialNumber, data);
    this.reset();
    return 0;
};

/* Delete Function */
function deletefn(event) {
    /* prevent form submission */
    event.preventDefault(); 
    /* retrieve form delete entry */
    const formData = new FormData(this);
    const serialNumber  = formData.get('delete_entry');
    if (!(serialNumber in database)){
        alert("Serial Number not found");
        return 404;
    };
    /* retrieve table data */
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const row_index = database[serialNumber]["row_index"];
    /* delete data from table (currently from display only) */
    tableBody.deleteRow(row_index);
    /* modify row index and delete data from database */
    delete database[serialNumber];
    /* update row index for other entries */
    for (let data in database){
        if (database[data]["row_index"] > row_index){
            database[data]["row_index"] -= 1;
        }
    };
    /* log data and reset form */
    console.log('Entry Deleted:', serialNumber);
    this.reset();
    return 0;
};

/* Filter function */
function filter(){
    /* select category and do filtering */
    const selectedCategory = this.value;
    const category = document.getElementById('table_category');
    const filter = document.getElementById('category_filter');
    category.textContent = selectedCategory == '' ? 'All Categories' : selectedCategory;
    /* append to filter element */
    category.appendChild(filter);
    /* re-render table */
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        /* get the row data and check if category matches */
        const row = rows[i];
        const rowCategory = row.getAttribute('class');
        if (selectedCategory == '' || rowCategory == known_categories[selectedCategory]){ 
            row.style.display = '';
        } else {
            row.style.display = 'none';
        };
    };
    return 0;
};

/* reset checkboxes */
function resetCheckBoxes(){
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    /* for each row, uncheck the checkbox */
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const checkbox = row.getElementsByClassName('row-checkbox')[0];
        if (checkbox.checked) {
            checkbox.checked = false;
        };
    };
    return 0;
};

/* delete selected rows */
function deleteSelected(){
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    /* for each row, check if the checkbox is checked */
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const checkbox = row.getElementsByClassName('row-checkbox')[0];
        if (checkbox.checked) {
            const deletedArray = Array.from(row.cells).map(cell => cell.textContent);
            const serialNumber = deletedArray[0];
            delete database[serialNumber];
            tableBody.removeChild(row);
            /* important to decrement i as the row is removed */
            i -= 1;
            console.log('Entry Deleted:', serialNumber);
        }
        else {
            /* update row index for other entries */
            const serialNumber = row.cells[0].textContent;
            database[serialNumber]["row_index"] = i;
        };
    };

};

/* update selected rows */
function updateSelected(){
    const tableBody = document.getElementById('expense_table').getElementsByTagName('tbody')[0];
    const rows = tableBody.getElementsByTagName('tr');
    const selected = [];
    /* for each row, check if the checkbox is checked and keep these entries in an array */
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const checkbox = row.getElementsByClassName('row-checkbox')[0];
        if (checkbox.checked) {
            selected.push(row);
        };
    };
    /* handle each row sequentially by calling handleRowSequentially recursively */
    function handleRowSequentially(index){
        /* base case: we are done with the array */
        if (index >= selected.length){
            return;
        } 
        /* get the row data and open the modal */
        const row = selected[index];
        var myModal = document.getElementById("myModal");
        var popupForm = document.getElementById('popup_form');
        popupForm.reset();
        myModal.style.display = "block"; 
        const close = document.getElementById("close-button");

        /* populate the form with the row data */
        function handleFormSubmit(event){
            /* prevent form submission */
            event.preventDefault();           
            /* retrieve form update entry */
            const formData = new FormData(this);
            const dataArray = Array.from(formData.entries());
            /* update data to new row in table */
            const serialNumber = row.cells[0].textContent;
            const data = database[serialNumber];
            var j = 1;
            dataArray.forEach(([key,value]) => {
                if (data[key] != value){   
                    if (key == "amount") {
                        value = parseFloat(value).toFixed(2);
                    }
                    /* update row class attribute if category is changed */
                    if (key == "category"){
                        row.setAttribute("class", value in known_categories ? known_categories[value] : "others");
                    }
                    data[key] = value;
                    row.cells[j].textContent = value;
                };
                j ++;
            });
            /*  record updated data and uncheck checkbox */
            console.log('Entry Updated:', serialNumber, data);
            row.getElementsByClassName('row-checkbox')[0].checked = false;
            /* reset the modal to hidden*/
            myModal.style.display = "none";
            /* remove the eventListener from the modal to prevent stacking*/
            popupForm.removeEventListener('submit', handleFormSubmit);
            close.removeEventListener('click', closePopup);
            /* handle the next row */
            handleRowSequentially(index + 1);
        };
        /* eventlisterner function for closePopup */
        function closePopup(){
            var myModal = document.getElementById("myModal");  
            resetCheckBoxes();
            popupForm.removeEventListener('submit', handleFormSubmit);
            close.removeEventListener('click', closePopup);
            myModal.style.display = "none";
            return 0;
        };
        /* add event listener to the form */
        popupForm.addEventListener('submit', handleFormSubmit);
        close.addEventListener('click', closePopup);
    };
    /* start the recursive function */
    handleRowSequentially(0);
    return 0;
};

/* update local storage */
function updateLocalStorage() {
    localStorage.setItem('database', JSON.stringify(database));
};

function main(){
    
    /* Q4:  Listener for Display Tab. 
    Write code to uniquely identify the Display Tab in the HTML document using getElementbyID.
    Attach an event listener to it.
    Make the event listener call display() function defined above.
    */
    loadDataBase();
    display();

    /* Q2:  Listener for Add button. 
    Write code to uniquely identify the addExpense in the HTML document using getElementbyID.
    Attach an event listener to it.
    Make the event listener call add() function defined above.
    */
    document.getElementById('add_form').addEventListener('submit', add);

    
    /* Q3:  Listeners for Update and Delete button. 
    Write code to uniquely identify the updateExpense and deleteExpense in the HTML document using getElementbyId.
    Attach an event listener to each.
    Make the event listener call update() and delete() functions defined above.
    */
    document.getElementById('update_form').addEventListener('submit', update);
    document.getElementById('delete_form').addEventListener('submit', deletefn);
    document.getElementById('category_filter').addEventListener('change', filter);
    document.getElementById('delete_selected').addEventListener('click', deleteSelected);
    document.getElementById('update_selected').addEventListener('click', updateSelected);
    window.addEventListener('beforeunload', updateLocalStorage);
    /* uncomment the line below to clear local storage on page refresh */
    //window.addEventListener('beforeunload', () => localStorage.clear());
}

/*Q1: Function to display only the tab that is selected in the navigation bar
Call this function from HTML (using onclick) with a different parameter depending on which nav button is pressed.
E.g., when Add is pressed, call showTab('Add')
Hidden property can be set using the syntax:
document.getElementById('Add').hidden = true
*/
function expand(button){
    const name = button.className;
    if (name == "add_button"){
        document.getElementById("add").style.display = "flex";
        document.getElementById("add_form").reset();
        document.getElementById("update").style.display = "none";
        document.getElementById("display").style.display = "none";
        document.getElementById("delete").style.display = "none";
    }
    else if(name == "update_button"){
        document.getElementById("update").style.display = "flex";
        document.getElementById("update_form").reset();
        document.getElementById("display").style.display = "none";
        document.getElementById("add").style.display = "none";
        document.getElementById("delete").style.display = "none";
    }
    else if(name == "delete_button"){
        document.getElementById("delete").style.display = "flex";
        document.getElementById("delete_form").reset();
        document.getElementById("update").style.display = "none";
        document.getElementById("add").style.display = "none";
        document.getElementById("display").style.display = "none";
    }
    else if(name == "display_button"){
        document.getElementById('category_filter').value = '';
        /* call the function when the display button is clicked to reset category filter*/
        filter.call(document.getElementById('category_filter'));
        /* call the function when the display button is clicked to reset checkboxes*/
        resetCheckBoxes.call(document.getElementById('expense_table'));
        document.getElementById("display").style.display = "block";
        document.getElementById("update").style.display = "none";
        document.getElementById("add").style.display = "none";
        document.getElementById("delete").style.display = "none";
    }
};