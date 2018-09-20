var connections = [];

var steckerElements;

function fillSteckerCanvas()
{
    let parent = document.getElementById("stecker");

    let c = document.getElementById("cnvStecker");
    let ctx = c.getContext("2d");


    c.width = parent.offsetWidth;
    c.height = parent.offsetHeight;

    redraw(ctx, c);

    let selectedElement = null;
    c.addEventListener('mousedown', (e) => {
          const pos = {
            x: e.pageX - c.offsetLeft,
            y: e.pageY - c.offsetTop
          };
          steckerElements.some(rectangle => {
            if (isIntersect(pos, rectangle)) {
              selectedElement = rectangle;
              return true;
            }
            selectedElement = null;
          });
        });

    c.addEventListener('mousemove', (e) => {
          const pos = {
            x: e.pageX - c.offsetLeft,
            y: e.pageY - c.offsetTop
          };

          c.style.cursor = "default";
          steckerElements.some(rectangle => {
            if (isIntersect(pos, rectangle)) {
                c.style.cursor = "pointer";
            }
          });

          if (selectedElement != null)
          {
              redraw(ctx, c);
              ctx.beginPath();
              ctx.lineWidth = 4;
              let color = selectedElement.color;
              ctx.strokeStyle="rgb({0},{1},{2})".replace("{0}", color[0]).replace("{1}", color[1]).replace("{2}", color[2]);
              ctx.moveTo(selectedElement.x + selectedElement.width / 2, selectedElement.y + selectedElement.height / 2);
              ctx.lineTo(pos.x, pos.y);
              ctx.stroke();
          }
        });

    c.addEventListener('mouseup', (e) => {
          const pos = {
            x: e.pageX - c.offsetLeft,
            y: e.pageY - c.offsetTop
          };
          steckerElements.some(rectangle => {
            if (isIntersect(pos, rectangle)) {
                if (selectedElement != null)
                {
                    connect(selectedElement.id, rectangle.id);
                    redraw(ctx, c);
                    selectedElement = null;
                    return true;
                }
            }
          });
        });
}

function connect(id1, id2)
{
    clearAlreadyConnected(id1, id2);
    if (id1 != id2)
    {
        connections.push(
            {first: id1, second: id2}
        );
    }
    modifyStecker();
}

function clearAlreadyConnected(id1, id2)
{
    for (let i = connections.length - 1; i >= 0; i--)
    {
        if (connections[i].first == id1 || connections[i].second == id1 || connections[i].first == id2 || connections[i].second == id2)
        {
            connections.splice(i, 1);
        }
    };
}

function modifyStecker()
{
    let order = letters.slice(0);
    connections.forEach(connection => {
        let tmp = order[connection.first];
        order[connection.first] = order[connection.second];
        order[connection.second] = tmp;
    });
    let stecker = new Stecker(order.join(""));
    elements[0] = stecker;
    showMecanism();
}

function redraw(ctx, canvas)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSteckerValues(ctx, canvas.width, canvas.height);
    drawConnections(ctx);
}

function drawSteckerValues(ctx, width, height)
{
    let nbElementRow = letters.length / 3;
    let w = width / Math.ceil(nbElementRow);
    let h = height / 3;
    let margin = w/4;

    let fontSize = w - margin * 2;
    ctx.textAlign = "center";
    ctx.font = fontSize + "px Arial";

    let x = w / 2;
    let y = h / 4 * 3;

    steckerElements = [];

    let counter = 0;
    let i = 0;
    letters.forEach(letter => {
        if (counter == parseInt(nbElementRow) + 1)
        {
            x = w / 2;
            y += h;
            counter = 0;
        }
        ctx.fillText(letter, x, y);

        let rectangle = {
            id : i,
            x : x - fontSize / 2,
            y : y - fontSize,
            width : fontSize,
            height : fontSize,
            color: rgbColors(letters.length)[i]
        };

        steckerElements.push(rectangle);

        x += w;
        counter++;
        i++;
    });
}

function drawConnections(ctx)
{
    ctx.lineWidth=4;
    connections.forEach(connection => {
        let start = connection.first;
        let end = connection.second;
        let color = steckerElements[start].color;
        ctx.beginPath();
        ctx.strokeStyle="rgb({0},{1},{2})".replace("{0}", color[0]).replace("{1}", color[1]).replace("{2}", color[2]);
        ctx.moveTo(steckerElements[start].x + steckerElements[start].width / 2, steckerElements[start].y + steckerElements[start].height / 2);
        ctx.lineTo(steckerElements[end].x + steckerElements[end].width / 2, steckerElements[end].y + steckerElements[end].width / 2);
        ctx.stroke();
    });
    ctx.lineWidth=1;
}

function isIntersect(point, rectangle) {
  return point.x >= rectangle.x && point.x <= rectangle.x + rectangle.width && point.y >= rectangle.y && point.y <= rectangle.y + rectangle.height;
}
