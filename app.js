


//////////////////////////////////////////////////////////
// BUDGET CONTROLLER
//////////////////////////////////////////////////////////

// IIFE, anyomous function wrapped in ()
var budgetController = (function() {

    // Data model for exp & inc
    // must have a unique id number
    // store in an object
    // with id, description and value
    // create function constructors
    // Function constuctors begin with a Capital letter
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // and the same as expense but for income
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    /*
    example of forEach loop to calc totals
    0
    [200, 400, 100]
    sum = 0 + 200
    sum = 200 + 400
    sum = 600 + 100 = 700
    */
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        //then store result
        data.totals[type] = sum;
    };


    // Store exp/inc in an array
    var data = {
        allItems: {
            exp: [],
            inc: []    
        },
        totals: {
            exp: 0,
            inc: 0  
        },
        budget: 0,
        percentage: -1
    };


    // Public Method
    // Allows other modules to add a new item into our data structure
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // when the array is empty then ID is 0
            if(data.allItems[type].length > 0) {
                // Create new ID, must be a unique new number
                // remember we must be able to delete items & each ID must only exist once
                // [1 2 4 6 8], next ID = 9
                // ID = last ID + 1
                // to find the last ID, its the length of the array minus 1
                // ID = data.allItems[type][data.allItems[type].length - 1]
                // then to find out the ID and add 1
                // .id + 1; 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            }


            // Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);    
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);    
            }
            // then store the item in the allItems object arrays
            // we don't need an if/else statement because addItem function determines 'type' 
            // and then selects the exp or inc array
            // push adds the item to the end of that array
            data.allItems[type].push(newItem);
            // then return the new item
            // so that the other module/function, that calls this function will have direct access to item we just created
            return newItem;

        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6   
            // ids = [1 2 4 6 8]
            // index = 3
            // data.allItems[type][id]; won't work
            // because the id and index don't match
            // we must find out the index of the id, in order to delete it
            
            // create a loop
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            // returns the index number of the element of the array that we input
            index = ids.indexOf(id);
            
            // -1 means it didnt find the element
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            // calc total inc & exp
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calc budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            
            // calc percentage of income spent
            // with an if statement to check if inc is 0
            if (data.totals.inc > 0 ) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);    
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentage(); 
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };


})();





//////////////////////////////////////////////////////////
// UI CONTROLLER
//////////////////////////////////////////////////////////

var UIController = (function() {

    // to keep strings tidy and incase they need to be changed later
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        /*
        = or - before number
        exactly 2 decimal points
        comma seperating the thousands

        2310.4566 -> 2,310.46
        2000 -> +2,000.00
        */

        num = Math.abs(num);
        // toFixed converts to decimal
        num = num.toFixed(2);

        numSplit = num.split('.');

        // store in array
        int = numSplit[0];
        if (int.length > 3) {
            // Substring Method (index number where to start, how many charaters)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
        //callback(current, index)
        callback(list[i], i);
        }
    };
            

    // public method
    // a function that the IIFE will return
    return {
        getInput: function() {
            // we must return something, 
            // How to return 3 values at the same time??..
            // Return an object, with these 3 as properties
            // instead of having 3 seperate variables, return an object with 3 properties
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;
            // Create HTML string wih placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            
            // Replace the placeholder txt with some actual data (the data we receive from the object)
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        // Public Method to clear fields
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
             
            // Trick the slice method into thinking we're giving it an array, so it will return an array. See other notes
            // Store into an array
            fieldsArr = Array.prototype.slice.call(fields);
            
            // Loop over all elements of the fieldsArr 
            // and sets them to am empty string ""
            // callback function gives us access to the current element
            // which has access to the 3 elements current, index, array 
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            // Set focus back on first element of array
            // Use focus method
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
          
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
               
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months; 
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        
        // Make getDOMstrings public, so controller can see them
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();





//////////////////////////////////////////////////////////
// GLOBAL APP CONTROLLER
//////////////////////////////////////////////////////////

var controller = (function(budgetCtrl, UICtrl) {

    // Event Listeners
    var setupEventListeners = function() {

        // gets UI DOMstrings
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // Delete Item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. Calc percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percertages
        UICtrl.displayPercentages(percentages);
        
    };

    /////////////////////////////////
    // Control center of application
    // it tells the other modules what to do and gets data back, to use for other things
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        // if statement to make sure nothing happen if there is no value in the fields
        // !== different than
        // ! not operator
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3.  Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();   
            
            // 6. Calc & update percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // finds the ID moving up the DOM
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            // breaks up a string into different parts
            splitID = itemID.split('-');
            // [element number] e.g. [0] = 1, [1] = 2 
            type = splitID[0];
            // parseInt converts a string into a number
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();   
            
            // 4. Calc & update percentages
            updatePercentages();
        }
        
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// without this line of code nothing will happen
// there will be no event listeners
controller.init();
























