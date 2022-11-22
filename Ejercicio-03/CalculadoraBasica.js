"use strict";
class Calculadora {

    constructor (){
        this.mem = Number(0);
        this.pantalla = "0";
        this.accumulator = "0";
        this.currentNumber = "0";
        this.deleteMem = true;
        this.equalsActive = false;
        this.opActive = false;
        this.op = "+";
    }

    // BUTTONS

    digitos(n){
        this.addToNumber(n);
    }
    punto(){
        this.addToNumber(".");
    }
    suma(){
        this.newOperation("+");    
    }
    resta(){
        this.newOperation("-");
    }
    multiplicacion(){
        this.newOperation("x","*");
    }
    division(){
        this.newOperation("/");
    }
    raiz(){ 
        this.unaryOperation("Math.sqrt");
    }
    cambioDeSigno() {
        this.unaryOperation("-");
    }
    porcentaje(){
        this.unaryOperation("Number(0.01) * ");

        if (this.op=="+" || this.op=="-" ) {
            this.unaryOperation(this.accumulator + " * ");
        }
    }
    /**
     * Sets the current operand to the value stored in memory.
     * If pressed twice, clears the memory.
     */
     mrc(){
        if (this.deleteMem) {
            this.mem = Number(0);
        } else {
            this.updateNumber(String(this.mem));
            this.deleteMem = true;
        }   
    }
    /**
     * Subtracts to the memory the result of evaluating the current operation,
     * then sets the current operand to the value stored in memory.
     */
    mMenos(){
        try {
            this.addToMemory(-Number(this.binaryOperation()));
        } catch(ex) {
            this.handleError(ex);
        }
    }
    /**
     * Adds to the memory the result of evaluating the current operation,
     * then sets the current operand to the value stored in memory.
     */
    mMas(){
        try {
            this.addToMemory(Number(this.binaryOperation()));
        } catch(ex) {
            this.handleError(ex);
        }
    }
    /**
     * Stores the result of the current operation in the accumulator and 
     * displays it on the screen.
     */
     igual(){
        if (this.opActive && this.op == '/') {
            this.accumulator = "1";
        }

        try {
            this.accumulator = this.binaryOperation();
            this.pantalla = this.accumulator;
            this.updateScreen();
            this.equalsActive = true;
            this.opActive = false;
        }
        catch(ex) {
            this.handleError(ex);
        }
    }
    /**
     * Clears the current operand.
     */
     clearEntry(){
        if (this.equalsActive) {
            this.borrar();
        } else if (!this.opActive) {
            this.updateNumber("0");
        }
    }
    /**
     * Resets the calculator to its initial state.
     */
     borrar(){
        this.op = "+";
        this.opActive = false;
        this.accumulator = "0";
        this.currentNumber = "0";
        this.pantalla = "0";
        this.updateScreen();
    }


    // UPDATE CURRENT OPERAND

    /**
     * Adds a character (digit or point) to the current operand.
     * If a point is added when the operand already contains one, it won't be updated.
     * @param {String} c the new character in the screen
     */
    addToNumber(c) {
        this.checkNewNumber();
        if (!(c=="." && this.currentNumber.includes("."))) {
            this.updateNumber(this.currentNumber + c);
        }  
    }
    /**
     * Initializes the operand to 0 if there is no number selected.
     */
    checkNewNumber() {
        if (this.equalsActive) {
            this.borrar();
        }
        if (this.opActive) {
            this.currentNumber = "";
            this.opActive = false;
        }
    }
    /**
     * Sets the current operand to the given value.
     * @param {String} value the new value for the current operand
     */
    updateNumber(value) {
        this.currentNumber = this.removeLeadingZeros(value);
        this.pantalla = this.currentNumber;
        this.updateScreen();
    }
    /**
     * Formats the given number removing leading zeros.
     * @param {String} value the current value displayed on the screen
     * @returns value without useless zeros at the left
     */
    removeLeadingZeros(value) {
        if (value == '.') {
            return "0.";
        }
        if (this.currentNumber == "0" && !String(value).endsWith(".")) {
            return String(Number(value));
        }
        return value;
    }


    // CALCULATE OPERATIONS
    
    /**
     * Sets the current operator to the given one.
     * If there are two operands stored, their partial result is computed.
     * @param {String} display the character to be displayed representing the operator
     * @param {String} newOp the operator to be used in the calculations
     */
    newOperation(display, newOp=display) {
        if (this.currentNumber.length <= 0) return;

        this.pantalla = display;
        this.updateScreen();
        try {
            if (!this.opActive && !this.equalsActive) {
                this.accumulator = this.binaryOperation();
            }
            this.opActive = true;
            this.op = newOp;
        }
        catch(ex) {
            this.handleError(ex);
        }  
    } 
    /**
     * Applies the given function to the current operand.
     * @param {String} f the function to be applied
     */
    unaryOperation(f) {
        if (this.opActive) return;
        
        var argument = this.currentNumber;

        if (this.equalsActive) {
            argument = this.accumulator;
            this.borrar();
        }
        try {
            var result = this.calculateOperation(f+"("+Number(argument)+")");
            this.updateNumber(result);
        }
        catch(ex) {
            this.handleError(ex);
        }  
    }
    /**
     * @returns a String with the result of evaluating the binary operation stored
     */
    binaryOperation() {
        return this.calculateOperation(
                Number(this.accumulator) + this.op + Number(this.currentNumber));
    }
    
    /**
     * Evaluates the given expression and returns its result.
     * Throws "MATH ERROR" if the result is not finite or a number.
     * @param {String} toEval the operation to be calculated
     */
    calculateOperation(toEval) {
        try {
            var result = eval(toEval);
        }
        catch(ex) {
            if (ex == "MATH ERROR") throw ex;
            throw "SYNTAX ERROR";
        }
        if (Number.isNaN(result) || !Number.isFinite(result)) {
            throw "MATH ERROR";
        }
        return String(result);
    }
    /**
     * Resets the calculator and displays an error message on the screen.
     * @param {String} ex the error found
     */
    handleError(ex) {
        this.borrar();
        this.pantalla = ex;
        this.updateScreen();
    }


    // MEMORY

    /**
     * Adds the given value to the independent memory.
     * @param {Number} value the value to be added to the memory
     */
    addToMemory(value) {
        this.mem += value;
        this.borrar()
        this.updateNumber(String(this.mem));
    }


    // INPUT - OUTPUT

    /**
     * Updates the value displayed on the screen.
     */
    updateScreen() {
        document.querySelector("input[type=text]").value = this.pantalla;
        this.deleteMem = false;
        this.equalsActive = false;
    }
    
    /**
     * Calls a function depending on the key pressed.
     * @param {String} key the key pressed
     */
    readKey(key) {
        if (key >= '0' && key <= '9') {
            this.digitos(key);
        }
        else if (key == '.') {
            this.punto();
        }
        else if (key == '+') {
            this.suma();
        }
        else if (key == '-') {
            this.resta();
        }
        else if (key == '*') {
            this.multiplicacion();
        }
        else if (key == '/') {
            this.division();
        }
        else if (key == 'r') {
            this.raiz();
        }
        else if (key == '%') {
            this.porcentaje();
        }
        else if (key == '/') {
            this.division();
        }
        else if (key == 'b') {
            this.mMas();
        }
        else if (key == 'n') {
            this.mMenos();
        }
        else if (key == 'm') {
            this.mrc();
        }
        else if (key == 'Backspace') {
            this.clearEntry();
        }
        else if (key == 'Escape') {
            this.borrar();
        }
        else if (key == '¡') {
            this.cambioDeSigno();
        }
        else if (key == '=' || key == 'Enter') {
            this.igual();
        }
    }
}

var calc = new Calculadora();

document.addEventListener('keydown', function(event) {
    calc.readKey(event.key);
});