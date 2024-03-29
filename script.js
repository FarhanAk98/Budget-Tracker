const $ = selector => document.querySelector(selector); 

let expences = [];
let Budget = 0, AmountSpent = 0, maxExp = 0, height = 0, mousePressed = -1;

function SetBars(){
    let Total = expences.length;
    let width = 80 / Total;
    let gap = 20 / (Total + 1);
    let xPos = gap;
    AmountSpent = 0;
    let pos1 = 0, pos2 = 0;
    for(exp of expences){
        height = (exp.itemCost / maxExp) * 330;
        AmountSpent += exp.itemCost;
        const bar = '.Bar.' + exp.itemName;
        const line = '.line.' + exp.itemName;
        const label = '.label.' + exp.itemName;
        $(bar).style.height = height + 'px';
        $(bar).style.top = -height + 'px';
        $(bar).style.width = width + '%';
        $(bar).style.left = xPos + '%';
        $(label).style.left = xPos+ '%';
        $(label).style.width = width + '%';

        $(line).style.backgroundColor = '';
        $(line).style.zIndex = 0;

        $(line).style.top = -height + 'px';
        $(line + ' p').innerText = '$' + exp.itemCost.toFixed(2);
        $(line + ' p').style.left = '-' + $(line + ' p').innerText.length * 9.28 + 'px';
        
        $(bar).addEventListener('mouseover', () => {
            $(line).style.opacity = '1';
            $(line).style.zIndex = 1;
            $(label).style.overflow = 'visible';
        });
        $(bar).addEventListener('mouseout', () => {
            $(line).style.opacity = '0';
            $(line).style.zIndex = 0;
            $(label).style.overflow = 'hidden';
        });

        if(exp.Flexibility == 'modifiable'){
            $(bar + ' .modifyBar').addEventListener('mouseover', () => {
                $(bar + ' .modifyBar').style.backgroundImage = 'linear-gradient(rgb(226, 228, 172, 0.9), rgb(226, 228, 172, 0))';
            });

            $(bar + ' .modifyBar').addEventListener('mouseout', () => {
                $(bar + ' .modifyBar').style.backgroundImage = '';
            });

            $(bar + ' .modifyBar').onmousedown = (evt) => {
                pos2 = evt.clientY;
                document.onmouseup = closedrag;
                document.onmousemove = drag;
            };

            function drag(e){
                pos1 = pos2 - e.clientY;
                pos2 = e.clientY;
                if((pos1 - $(bar).offsetTop) < 331 & (pos1 - $(bar).offsetTop) > 2){
                    let ex = expences.find(ex => ex.itemName === bar.slice(5, bar.length));

                    $(bar).style.height = ($(bar).offsetHeight + pos1) + 'px';
                    $(bar).style.top = ($(bar).offsetTop - pos1) + 'px';
                    $(line).style.top = ($(line).offsetTop - pos1) + 'px';

                    AmountSpent -= ex.itemCost;
                    ex.itemCost = (maxExp * $(bar).offsetHeight) / 330;
                    AmountSpent += ex.itemCost;

                    $(line + ' p').innerText = '$' + ex.itemCost.toFixed(2);
                    $(line + ' p').style.left = '-' + $(line + ' p').innerText.length * 9.28 + 'px';

                    UpdateSavings(AmountSpent);
                }
            }

            function closedrag(){
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        $(bar + ' .deleteBar').addEventListener('mouseover', () => {
            $(bar + ' .deleteBar').style.backgroundImage = 'linear-gradient(rgb(255, 0, 0, 0), rgb(255, 0, 0, 0.7))';
        });
    
        $(bar + ' .deleteBar').addEventListener('mouseout', () => {
            $(bar + ' .deleteBar').style.backgroundImage = '';
        });

        $(bar + ' .deleteBar').addEventListener('click', () => {
            if($(bar) !== null){
                let ex = expences.find(ex => ex.itemName === bar.slice(5, bar.length));
                expences.splice(expences.indexOf(ex), 1);
                $(bar).remove();
                $(line).remove();
                $(label).remove();
                SetBars();
            }
        });

        xPos += (width + gap);
    }

    UpdateSavings(AmountSpent);
}

function UpdateSavings(amt){
    if(amt > Budget){
        $('#Savings').style.color = 'red';
        $('#Savings').innerText = 'Over Budget: $' + (amt - Budget).toFixed(2).toString();
    }
    else{
        $('#Savings').style.color = 'black';
        $('#Savings').innerText = 'Savings: $' + (Budget - amt).toFixed(2).toString();
    }
}

function UpdateHeight(dir){
    if(expences.length > 0 & ((dir == -1 & maxExp > 10) || (dir == 1 & maxExp <= 10000))){
        maxExp += 10 * dir * (maxExp * 0.001);
        for(exp of expences){
            height = (exp.itemCost / maxExp) * 330;
            const bar = '.Bar.' + exp.itemName;
            const line = '.line.' + exp.itemName;
            $(bar).style.height = height + 'px';
            $(bar).style.top = -height + 'px';
            $(line).style.top = -height + 'px';
        }
    }
}

function StopUpdateHeight(){
    if(mousePressed != -1){
        clearInterval(mousePressed);
        mousePressed = -1;
    }
}

$('#UpdateBudget').addEventListener('click', () => {
    $('#Error').innerText = "";
    let value = parseInt($('#BudgetValue').value);
    if(isNaN(value)){
        $('#Error').innerText = "Please fill appropriate values.";
    }
    else{
        $('#Budget').innerText = 'Budget: $' + $('#BudgetValue').value;
        Budget = parseInt($('#BudgetValue').value);
        UpdateSavings(AmountSpent);
        $('#Form2').style.visibility = 'visible';
    }
});

$('#plus').onmousedown = () => {
    mousePressed = setInterval(UpdateHeight, 20, -1);
};
$('#plus').onmouseup = () => {
    StopUpdateHeight();
};

$('#minus').onmousedown = () => {
    mousePressed = setInterval(UpdateHeight, 20, 1);
};
$('#minus').onmouseup = () => {
    StopUpdateHeight();
};

$('#AddExpence').addEventListener('click', () => {
    $('#Error').innerText = "";

    const exp = {
        itemName: $('#item').value.replace(/\s/g, ''),
        itemCost: parseInt($('#cost').value),
        Flexibility: $('input[name="flexibility"]:checked').value
    };

    if(expences.some(ex => ex.itemName === exp.itemName)){
        $('#Error').innerText = "Please fill new values.";
    }
    else if(exp.itemName == "" || isNaN(exp.itemCost)){
        $('#Error').innerText = "Please fill appropriate values.";
    }
    else{
        expences.push(exp);

        maxExp = Math.max(maxExp, exp.itemCost);

        $('#xAxis').innerHTML += '<div class="Bar ' + exp.itemName + '">' + 
                                 '<div class="modifyBar"></div>' +
                                 '<div class="deleteBar"></div>' + 
                                 '</div>' +
                                 '<div class="line ' + exp.itemName + '">' + 
                                 '<p></p>' +
                                 '</div>' +
                                 '<p class="label ' + exp.itemName + '">' + exp.itemName + '</p>';
        SetBars();
    }
});