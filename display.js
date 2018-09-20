let c;
let parent;
let ctx;

var THICK = 4;

function showMecanism()
{
    if(c==undefined)
    {
        c = document.getElementById("cnv");
        ctx = c.getContext("2d");
    }
    if (parent == undefined)
    {
        parent = document.getElementById("machine");
    }

    updateRotorsPosition();

    ctx.clearRect(0, 0, c.width, c.height);
    c.width = parent.offsetWidth;
    c.height = parent.offsetHeight;
    let margin = c.width * 0.05;
    let width = c.width / elements.length - margin;
    let height = c.height - margin;
    let x = margin / 2;
    let y = margin / 2;

    elements[0].draw(x, y, width, height);
    x += width + margin;

    for (let i = 1; i < elements.length - 1; i++)
    {
        positionButton(document.getElementById("rotor"+i+"Inc"), x, width, true);

        elements[i].draw(x, y, width, height);

        positionButton(document.getElementById("rotor"+i+"Sub"), x, width, false);

        x += width + margin;
    }

    elements[4].draw(x, y, width, height);
    x += width + margin;
}

function updateRotorsPosition()
{
    for(let i = 1; i <= 3; i++)
    {
        updateIndex(document.getElementById("rotor"+i+"Position"), elements[i].rotation);
    }
}

function updateIndex(rotorText, rotorPosition)
{
    rotorText.innerHTML = rotorPosition;
}

function invalidate()
{
    for(let i = 0; i < elements.length; i++)
    {
        elements[i].ls.path = [];
    }
}

function positionButton(button, x, width, top)
{
    button.style.position = "absolute";
    button.style.width = width+"px";
    button.style.left = x + "px";
    button.style.zIndex  = 2;
    if (top)
        button.style.top = "2px";
    else
        button.style.bottom = "2px";
}

var Alignment = Object.freeze({"Left" : "left", "Center" : "center", "Right" : "right"});


function drawReflectorLine(reflector, width)
{
    if (reflector.ls.path.length > 0)
    {
        ctx.lineWidth = THICK;
        ctx.strokeStyle = "Red";
        ctx.beginPath();
        let startPos = reflector.ls.inputPositions[reflector.ls.path[0]];
        let endPos = reflector.ls.inputPositions[reflector.ls.path[1]];
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(startPos.x + width, startPos.y);
        ctx.lineTo(endPos.x + width, endPos.y);
        drawArrow({ "x" : endPos.x + width, "y" : endPos.y}, { "x" : endPos.x, "y" : endPos.y});
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}

var Type = Object.freeze({"Normal" : "Normal", "LeftToRight" : "LeftToRight", "RightToLeft" : "RightToLeft"});

/**
 * Draw the lines inside the rotor (inputs to outputs)
 * @param rotor : rotor whose lines will be drawed
 */
function drawLines(rotor)
{
    for (let i = 0; i < rotor.ls.inputs.length; i++)
    {
        let type = Type.Normal;
        if (rotor.ls.path.includes(i))
        {
            if (rotor.ls.path[0] == i)
                type = Type.LeftToRight;
            else
                type = Type.RightToLeft;
        }
        drawLine(rotor.ls.inputPositions[i], rotor.ls.outputPositions[rotor.ls.getConnection(i, false)], rgbColors(rotor.ls.inputs.length)[i], type);
    }

}

/**
 * Draw a line from a point to another
 * @param startPos : starting position. Must be an object containing x and y as attributes.
 * @param endPos : ending position. Must be an object containing x and y as attributes.
 * @param color : color used to draw the line. Must be an array containing the RGB values of the color.
 */
function drawLine(startPos, endPos, color, type)
{
    ctx.beginPath();
    ctx.strokeStyle="rgb({0},{1},{2})".replace("{0}", color[0]).replace("{1}", color[1]).replace("{2}", color[2]);
    if (type == Type.Normal)
        ctx.lineWidth = 0.75;
    else
        ctx.lineWidth = THICK;
    if (type == Type.LeftToRight)
        drawArrow(startPos, endPos);
    else if (type == Type.RightToLeft)
        drawArrow(endPos, startPos);
    else
    {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
    }
    ctx.stroke();
    ctx.lineWidth=1;
}

function drawArrow(startPos, endPos){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(endPos.y-startPos.y,endPos.x-startPos.x);
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.lineTo(endPos.x-headlen*Math.cos(angle-Math.PI/6),endPos.y-headlen*Math.sin(angle-Math.PI/6));
    ctx.moveTo(endPos.x, endPos.y);
    ctx.lineTo(endPos.x-headlen*Math.cos(angle+Math.PI/6),endPos.y-headlen*Math.sin(angle+Math.PI/6));
}

/**
 * Draw the values specified in the array in the rectangle specified by x, y, width and height and align
 * @param x : x coordinate of the rectangle containing the values
 * @param y : y coordinate of the rectangle containing the values
 * @param width : width of the rectangle containing the values
 * @param height : height of the rectangle containing the values
 * @param array : array containing the values to be drawn
 * @param alignment : define whether the text will be aligned to the left, center or right.
                      Use either Alignment.Left, Alignment.Center or Alignment.Right
 */
function drawValues(x, y, width, height, array, alignment)
{
    ctx.textAlign = alignment;
    let positions = [];
    // Define the font size (90% of a block)
    let fontSize = height / array.length * 0.9;
    ctx.font= "%1px Arial".replace("%1", fontSize);
    // Define the margin (10% of a block)
    let margin = fontSize / 9;

    // Alignement of the first value
    let x1 = x;
    let y1 = y + margin / 2 + fontSize;
    let longest = array.map(String).reduce(function (a, b) { return a.length > b.length ? a : b; });
    let maxWidth = ctx.measureText(longest).width;
    if (alignment == Alignment.Right)
        x1 += maxWidth;
    else if (alignment == Alignment.Left)
        x1 += width - maxWidth;

    // Draw the values
    for(let i = 0; i < array.length; i++)
    {
        positions.push({ "x" : x1, "y" : y1 - fontSize / 2});
        drawValue(x1, y1, array[i]);
        y1 += fontSize + margin;
    }
    return positions;
}

/**
 * Draw a value at the specified position
 * @param x : x coordinate of the value that will be drawn
 * @param y : y coordinate of the value that will be drawn
 * @param value : value that will be drawn
 */
function drawValue(x, y, value)
{
    ctx.fillText(indexToLetter(value), x, y);
}

function toggle_options()
{
   var e = document.getElementById("options");
   var link = document.getElementById("hideOptions");
   if(e.style.display == 'none')
   {
       e.style.display = 'block';
       link.innerHTML = "(masquer)";
   }
   else
   {
      e.style.display = 'none';
      link.innerHTML = "(afficher)";
   }
}
