const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

/**
 * Used to easily swap two letters
 * @param outputs : string containing a list of letters in the order whished for the swap.
 * e.g. if the string starts with E, A (the first letter) will then be swapped with E.
 */
function LetterSwapper(outputs)
{
    let parent = this;
    this.inputs = letters.map(letterToIndex);
    this.outputs = outputs.split('').map(letterToIndex);

    /**
     * Get the connecting value in function of the id and the direction
     * @param id : identifier of the value that we want to convert
     * @param rightToLeft : whether the value must be converted from the input array to the output or vice versa
     * @return index of the specified id in the input or output array (depends on the direction)
     */
    this.getConnection = function(id, rightToLeft)
    {
        if (rightToLeft)
        {
            return parent.inputs.indexOf(parent.outputs[id]);
        }
        else
        {
            return parent.outputs.indexOf(parent.inputs[id]);
        }
    }

    this.clearPath = function()
    {
        parent.path = [];
    }

    this.addPath = function(value)
    {
        parent.path.push(value);
    }

    this.clearPath();
}

function Stecker(outputs)
{
    let parent = this;
    this.ls = new LetterSwapper(outputs);
    this.getConnection = this.ls.getConnection;
    this.clearPath = this.ls.clearPath;
    this.addPath = this.ls.addPath;

    /**
     * Used to draw the stecker on the canvas.
     * @param x : x coordinate of the stecker
     * @param y : y coordinate of the stecker
     * @param width : width of the stecker
     * @param height : height of the stecker
     */
    this.draw =  function(x, y, width, height)
    {
        ctx.strokeStyle="#000";
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        parent.ls.inputPositions = drawValues(x, y, width, height, parent.ls.inputs, Alignment.Right);
        parent.ls.outputPositions = drawValues(x, y, width, height, parent.ls.inputs, Alignment.Left);
        drawLines(parent);
    }

    this.clearPath();
}

/**
 * Used to act as rotor.
 * It contains a letter swapper and can be rotated.
 * It holds the number of rotation in order to know later when a full rotation has occured
 * to rotate its neighbour rotor.
 */
function Rotor(outputs)
{
    let parent = this;
    this.rotation = 0;
    this.ls = new LetterSwapper(outputs);
    this.getConnection = this.ls.getConnection;
    this.clearPath = this.ls.clearPath;
    this.addPath = this.ls.addPath;
    /**
     * Used to draw a rotor on the canvas.
     * @param x : x coordinate of the rotor
     * @param y : y coordinate of the rotor
     * @param width : width of the rotor
     * @param height : height of the rotor
     */
    this.draw =  function(x, y, width, height)
    {
        ctx.strokeStyle="#000";
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        parent.ls.inputPositions = drawValues(x, y, width, height, parent.ls.inputs, Alignment.Right);
        parent.ls.outputPositions = drawValues(x, y, width, height, parent.ls.inputs, Alignment.Left);
        drawLines(parent);
    }

    /**
     * Used to rotate the input and output arrays.
     */
    this.rotate = function(inc = true)
    {
        if (inc)
        {
            parent.ls.inputs.push(parent.ls.inputs.shift());
            parent.ls.outputs.push(parent.ls.outputs.shift());

            parent.rotation = reverseClamp(parent.rotation + 1, 0,parent.ls.inputs.length);
        }
        else
        {
            parent.ls.inputs.unshift(parent.ls.inputs.pop())
            parent.ls.outputs.unshift(parent.ls.outputs.pop())

            parent.rotation = reverseClamp(parent.rotation - 1, 0,parent.ls.inputs.length);
        }
        invalidate();
        showMecanism();
    }

    this.clearPath();
}

function Reflector(outputs)
{
    let parent = this;
    this.ls = new LetterSwapper(outputs);
    this.getConnection = this.ls.getConnection;
    this.clearPath = this.ls.clearPath;
    this.addPath = this.ls.addPath;

    /**
     * Used to draw the stecker on the canvas.
     * @param x : x coordinate of the stecker
     * @param y : y coordinate of the stecker
     * @param width : width of the stecker
     * @param height : height of the stecker
     */
    this.draw =  function(x, y, width, height)
    {
        ctx.strokeStyle="#000";
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        parent.ls.inputPositions = drawValues(x, y, width, height, parent.ls.inputs, Alignment.Right);
        drawReflectorLine(parent, width / 2);
    }

    this.clearPath();
}

/**
 * Converts a letter into the corresponding index starting with A = 0, B = 1 and so on...
 */
function letterToIndex(letter)
{
    return letter.toUpperCase().charCodeAt(0) - letters[0].charCodeAt(0);
}

/**
 * Converts an index into a letter. 0 will be A, 1 will be B etc.
 */
function indexToLetter(index)
{
    return letters[index]
}

var availableRotorsCode = ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 'ESOVPZJAYQUIRHXLNFTGKDCMWB', 'VZBRGITYUPSDNHLXAWMJQOFECK'];

var stecker = new Stecker('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

var rotor1 = new Rotor(availableRotorsCode[0]);
var rotor2 = new Rotor(availableRotorsCode[1]);
var rotor3 = new Rotor(availableRotorsCode[2]);
var rotor4 = new Rotor(availableRotorsCode[3]);
var rotor5 = new Rotor(availableRotorsCode[4]);

var reflector = new Reflector('EJMZALYXVBWFCRQUONTSPIKHGD');

var elements = [stecker, rotor1, rotor2, rotor3, reflector];


function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

async function encode()
{
    let result = "";
    for (let i of encryptMessage(document.getElementById('message').value))
    {
        result += i;
        document.getElementById("result").innerHTML = result;
        showMecanism();
        await sleep(document.getElementById('rngTime').value);
    }
}

/**
 * Encrypts a full message.
 */
function *encryptMessage(message)
{
    let result = "";
    for (let i = 0; i < message.length; i++)
    {
        letter = message[i].toUpperCase();
        if (letters.includes(letter))
        {
            if (rotateRotor(elements[1]))
                if (rotateRotor(elements[2]))
                    rotateRotor(elements[3])
            yield encryptOneLetter(letter);
        }
        else
        {
            yield message[i];
        }
    }
}

function rotateRotor(rotor)
{
    rotor.rotate();
    if (rotor.rotation == 0)
        return true;
    return false;
}

/**
 * Encrypts only one letter
 */
function encryptOneLetter(letter)
{
    let result = letterToIndex(letter);
    let rightToLeft = false;
    let arrayToIter = elements.slice(0);

    arrayToIter.map(function(element)
    {
        element.clearPath();
    });
    for (let iter = 0; iter < 2; iter++)
    {
        for(let i = 0; i < arrayToIter.length; i++)
        {
            elements[i].addPath(result);
            result = arrayToIter[i].getConnection(result, rightToLeft);
        }
        rightToLeft = !rightToLeft;
        elements = elements.reverse();
        elements[0].addPath(result);
        arrayToIter = arrayToIter.reverse().slice(1);
    }
    return indexToLetter(result);
}

function changeRotor(rotorPos, newRotor)
{
    elements[rotorPos] = new Rotor(availableRotorsCode[newRotor]);
    showMecanism();
}

function reverseClamp(value, min, max)
{
    if (value >= max)
        return min;
    if (value < min)
        return max - 1;
    return value;
}
