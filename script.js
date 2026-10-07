const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   TELAS
========================= */

const screens = {

    start:
        document.getElementById("startScreen"),

    player:
        document.getElementById("playerScreen"),

    difficulty:
        document.getElementById("difficultyScreen"),

    game:
        document.getElementById("gameScreen"),

    shop:
        document.getElementById("shopScreen"),

    gameOver:
        document.getElementById("gameOverScreen"),

    records:
        document.getElementById("recordsScreen")

};


function showScreen(name) {

    Object.values(screens).forEach(screen => {

        screen.classList.remove("active");

    });

    screens[name].classList.add("active");

}


/* =========================
   DIFICULDADES
========================= */

const difficulties = {

    normal: {

        name: "Normal",

        speed: 140,

        coinValue: 15,

        bonusChance: 0.08

    },

    hard: {

        name: "Difícil",

        speed: 100,

        coinValue: 25,

        bonusChance: 0.10

    },

    veryHard: {

        name: "Muito difícil",

        speed: 70,

        coinValue: 40,

        bonusChance: 0.12

    }

};


let selectedDifficulty = "normal";


/* =========================
   PEÇAS
========================= */

const computerParts = [

    {
        id: "motherboard",
        name: "Placa-mãe",
        price: 350
    },

    {
        id: "cpu",
        name: "Processador",
        price: 550
    },

    {
        id: "ram",
        name: "Memória RAM",
        price: 250
    },

    {
        id: "gpu",
        name: "Placa de vídeo",
        price: 900
    },

    {
        id: "ssd",
        name: "SSD",
        price: 350
    },

    {
        id: "power",
        name: "Fonte",
        price: 200
    }

];


/* =========================
   ESTADO DO JOGO
========================= */

let playerName = "";

let money = 0;

let snake = [];

let coins = [];

let bonus = null;

let direction = {
    x: 0,
    y: 0
};

let nextDirection = {
    x: 0,
    y: 0
};

let multiplier = 1;

let bonusTime = 0;

let bonusTimerInterval = null;

let ownedParts = [];

let gameRunning = false;

let gameTimer = null;

let gameFinished = false;


/* =========================
   CONFIGURAÇÃO DO MAPA
========================= */

const gridSize = 25;

const tileSize =
    canvas.width / gridSize;

const NUMBER_OF_COINS = 8;


/* =========================
   BOTÃO INICIAR
========================= */

document
    .getElementById("startGameButton")
    .addEventListener("click", () => {

        showScreen("player");

        document
            .getElementById("playerName")
            .focus();

    });


/* =========================
   RECORDS
========================= */

document
    .getElementById("recordsStartButton")
    .addEventListener("click", () => {

        renderRecords();

        showScreen("records");

    });


/* =========================
   NOME
========================= */

document
    .getElementById("continueNameButton")
    .addEventListener("click", continueName);


document
    .getElementById("playerName")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {

            continueName();

        }

    });


function continueName() {

    const input =
        document.getElementById("playerName");

    const error =
        document.getElementById("playerError");

    playerName =
        input.value.trim();

    if (playerName.length < 2) {

        error.textContent =
            "Digite pelo menos 2 caracteres.";

        return;

    }

    error.textContent = "";

    showScreen("difficulty");

}


/* =========================
   VOLTAR
========================= */

document
    .getElementById("backFromPlayer")
    .addEventListener("click", () => {

        showScreen("start");

    });


document
    .getElementById("backFromDifficulty")
    .addEventListener("click", () => {

        showScreen("player");

    });


document
    .getElementById("backFromRecords")
    .addEventListener("click", () => {

        showScreen("start");

    });


/* =========================
   ESCOLHER DIFICULDADE
========================= */

document
    .querySelectorAll(".difficulty-option")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedDifficulty =
                button.dataset.difficulty;

            startGame();

        });

    });


/* =========================
   INICIAR PARTIDA
========================= */

function startGame() {

    clearTimeout(gameTimer);

    clearInterval(bonusTimerInterval);

    money = 0;

    multiplier = 1;

    bonus = null;

    bonusTime = 0;

    ownedParts = [];

    gameFinished = false;

    /*
        A cobra começa PARADA.
    */

    snake = [

        {
            x: 12,
            y: 12
        },

        {
            x: 11,
            y: 12
        },

        {
            x: 10,
            y: 12
        }

    ];

    direction = {
        x: 0,
        y: 0
    };

    nextDirection = {
        x: 0,
        y: 0
    };

    gameRunning = false;

    coins = [];

    createCoins();

    updateGameInterface();

    drawGame();

    showScreen("game");

}


/* =========================
   CRIAR MOEDAS
========================= */

function createCoins() {

    coins = [];

    while (coins.length < NUMBER_OF_COINS) {

        const position =
            randomPosition();

        const alreadyExists =
            coins.some(coin =>

                coin.x === position.x &&
                coin.y === position.y

            );

        const onSnake =
            snake.some(part =>

                part.x === position.x &&
                part.y === position.y

            );

        if (
            !alreadyExists &&
            !onSnake
        ) {

            coins.push(position);

        }

    }

}


/* =========================
   POSIÇÃO ALEATÓRIA
========================= */

function randomPosition() {

    return {

        x:
            Math.floor(
                Math.random() * gridSize
            ),

        y:
            Math.floor(
                Math.random() * gridSize
            )

    };

}


/* =========================
   TECLADO
========================= */

document.addEventListener("keydown", event => {

    let newDirection = null;

    switch (event.key) {

        case "ArrowUp":

            newDirection = {
                x: 0,
                y: -1
            };

            break;

        case "ArrowDown":

            newDirection = {
                x: 0,
                y: 1
            };

            break;

        case "ArrowLeft":

            newDirection = {
                x: -1,
                y: 0
            };

            break;

        case "ArrowRight":

            newDirection = {
                x: 1,
                y: 0
            };

            break;

    }

    if (!newDirection) {
        return;
    }


    /*
        PRIMEIRO COMANDO

        Se a cobra ainda está parada,
        o primeiro comando começa
        a partida.
    */

    if (
        !gameRunning &&
        direction.x === 0 &&
        direction.y === 0
    ) {

        gameRunning = true;

        direction =
            newDirection;

        nextDirection =
            newDirection;

        gameLoop();

        return;

    }


    /*
        Se o jogo não estiver rodando,
        ignora o comando.
    */

    if (!gameRunning) {
        return;
    }


    /*
        Impede a cobra de voltar
        diretamente para o próprio corpo.
    */

    if (
        direction.x !== 0 &&
        newDirection.x === -direction.x
    ) {

        return;

    }


    if (
        direction.y !== 0 &&
        newDirection.y === -direction.y
    ) {

        return;

    }


    nextDirection =
        newDirection;

});


/* =========================
   LOOP
========================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    direction =
        nextDirection;


    if (
        direction.x === 0 &&
        direction.y === 0
    ) {

        return;

    }


    const head = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    /* COLISÃO COM PAREDE */

    if (

        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize

    ) {

        finishRun();

        return;

    }


    /* COLISÃO COM O CORPO */

    const hitBody =
        snake.some(part =>

            part.x === head.x &&
            part.y === head.y

        );


    if (hitBody) {

        finishRun();

        return;

    }


    snake.unshift(head);


    /* =========================
       MOEDAS
    ========================= */

    const coinIndex =
        coins.findIndex(coin =>

            coin.x === head.x &&
            coin.y === head.y

        );


    if (coinIndex !== -1) {

        collectCoin(coinIndex);

    } else {

        snake.pop();

    }


    /* =========================
       BÔNUS
    ========================= */

    if (
        bonus &&
        head.x === bonus.x &&
        head.y === bonus.y
    ) {

        collectBonus();

    }


    drawGame();

    updateGameInterface();


    const speed =
        difficulties[selectedDifficulty].speed;


    gameTimer =
        setTimeout(
            gameLoop,
            speed
        );

}


/* =========================
   COLETAR MOEDA
========================= */

function collectCoin(index) {

    const difficulty =
        difficulties[selectedDifficulty];

    const value =
        difficulty.coinValue *
        multiplier;

    money += value;


    let newCoin;

    do {

        newCoin =
            randomPosition();

    } while (

        coins.some(coin =>

            coin.x === newCoin.x &&
            coin.y === newCoin.y

        ) ||

        snake.some(part =>

            part.x === newCoin.x &&
            part.y === newCoin.y

        )

    );


    coins[index] =
        newCoin;


    maybeCreateBonus();

}


/* =========================
   CRIAR BÔNUS
========================= */

function maybeCreateBonus() {

    if (bonus) {
        return;
    }


    const chance =
        difficulties[
            selectedDifficulty
        ].bonusChance;


    if (Math.random() > chance) {
        return;
    }


    let position;

    do {

        position =
            randomPosition();

    } while (

        snake.some(part =>

            part.x === position.x &&
            part.y === position.y

        ) ||

        coins.some(coin =>

            coin.x === position.x &&
            coin.y === position.y

        )

    );


    bonus = position;

    bonusTime = 10;


    clearInterval(
        bonusTimerInterval
    );


    bonusTimerInterval =
        setInterval(() => {

            bonusTime--;

            updateGameInterface();


            if (bonusTime <= 0) {

                clearInterval(
                    bonusTimerInterval
                );

                bonus = null;

                bonusTime = 0;

                updateGameInterface();

            }

        }, 1000);

}


/* =========================
   COLETAR BÔNUS
========================= */

function collectBonus() {

    bonus = null;

    bonusTime = 0;

    multiplier = 2;


    clearInterval(
        bonusTimerInterval
    );


    setTimeout(() => {

        multiplier = 1;

        updateGameInterface();

    }, 5000);


    updateGameInterface();

}


/* =========================
   DESENHAR JOGO
========================= */

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* FUNDO */

    ctx.fillStyle =
        "#111827";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* GRADE */

    ctx.strokeStyle =
        "rgba(255,255,255,0.05)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x <= gridSize;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x * tileSize,
            0
        );

        ctx.lineTo(
            x * tileSize,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y <= gridSize;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * tileSize
        );

        ctx.lineTo(
            canvas.width,
            y * tileSize
        );

        ctx.stroke();

    }


    /* =========================
       MOEDAS
    ========================= */

    coins.forEach(coin => {

        const centerX =
            coin.x * tileSize +
            tileSize / 2;

        const centerY =
            coin.y * tileSize +
            tileSize / 2;


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            tileSize * 0.30,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#facc15";

        ctx.fill();


        ctx.strokeStyle =
            "#eab308";

        ctx.lineWidth = 2;

        ctx.stroke();

    });


    /* =========================
       BÔNUS
    ========================= */

    if (bonus) {

        const centerX =
            bonus.x * tileSize +
            tileSize / 2;

        const centerY =
            bonus.y * tileSize +
            tileSize / 2;


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            tileSize * 0.35,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#a855f7";

        ctx.fill();


        ctx.strokeStyle =
            "#d8b4fe";

        ctx.lineWidth = 3;

        ctx.stroke();

    }


    /* =========================
       COBRA
    ========================= */

    snake.forEach((part, index) => {

        const padding = 2;


        ctx.fillStyle =
            index === 0
                ? "#22c55e"
                : "#16a34a";


        ctx.fillRect(

            part.x * tileSize +
                padding,

            part.y * tileSize +
                padding,

            tileSize -
                padding * 2,

            tileSize -
                padding * 2

        );


        if (index === 0) {

            ctx.fillStyle =
                "#ffffff";


            const eyeSize =
                3;


            ctx.fillRect(

                part.x * tileSize +
                    tileSize * 0.28,

                part.y * tileSize +
                    tileSize * 0.28,

                eyeSize,
                eyeSize

            );


            ctx.fillRect(

                part.x * tileSize +
                    tileSize * 0.62,

                part.y * tileSize +
                    tileSize * 0.28,

                eyeSize,
                eyeSize

            );

        }

    });


    /*
        Quando a cobra está parada,
        mostra uma indicação visual.
    */

    if (
        !gameRunning &&
        snake.length > 0
    ) {

        ctx.fillStyle =
            "rgba(255,255,255,0.8)";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(

            "APERTE UMA SETA PARA COMEÇAR",

            canvas.width / 2,

            canvas.height - 15

        );

    }

}


/* =========================
   INTERFACE
========================= */

function updateGameInterface() {

    document
        .getElementById("money")
        .textContent =
            money;


    document
        .getElementById("shopMoney")
        .textContent =
            money;


    document
        .getElementById("multiplier")
        .textContent =
            multiplier + "x";


    const timerElement =
        document.getElementById(
            "bonusTimer"
        );


    if (
        bonus &&
        bonusTime > 0
    ) {

        timerElement.textContent =
            bonusTime + "s";

    } else {

        timerElement.textContent =
            "";

    }


    renderParts();

}


/* =========================
   PEÇAS
========================= */

function renderParts() {

    const container =
        document.getElementById(
            "partsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    computerParts.forEach(part => {

        const owned =
            ownedParts.includes(
                part.id
            );


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "part-status " +
            (
                owned
                    ? "owned"
                    : ""
            );


        element.innerHTML = `

            <span>
                ${part.name}
            </span>

            <strong>
                ${
                    owned
                        ? "Comprada"
                        : "$" + part.price
                }
            </strong>

        `;


        container.appendChild(
            element
        );

    });

}


/* =========================
   FINALIZAR PARTIDA
========================= */

document
    .getElementById("finishRunButton")
    .addEventListener("click", () => {

        if (!gameRunning) {

            openShop();

            return;

        }


        finishRun();

    });


function finishRun() {

    if (gameFinished) {
        return;
    }


    gameFinished = true;

    gameRunning = false;


    clearTimeout(gameTimer);

    clearInterval(
        bonusTimerInterval
    );


    bonus = null;

    multiplier = 1;

    bonusTime = 0;


    openShop();

}


/* =========================
   LOJA
========================= */

function openShop() {

    renderShop();

    showScreen("shop");

}


/* =========================
   RENDER LOJA
========================= */

function renderShop() {

    const container =
        document.getElementById(
            "shopParts"
        );


    container.innerHTML = "";


    document
        .getElementById(
            "shopMoney"
        )
        .textContent =
            money;


    computerParts.forEach(part => {

        const owned =
            ownedParts.includes(
                part.id
            );


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "shop-item " +
            (
                owned
                    ? "owned"
                    : ""
            );


        item.innerHTML = `

            <h3>
                ${part.name}
            </h3>

            <p>
                Componente necessário
                para montar o computador.
            </p>

            <div class="price">
                $${part.price}
            </div>

            <button
                ${owned ? "disabled" : ""}
                data-part="${part.id}">

                ${
                    owned
                        ? "COMPRADA"
                        : "COMPRAR"
                }

            </button>

        `;


        const button =
            item.querySelector(
                "button"
            );


        if (!owned) {

            button.addEventListener(
                "click",
                () => {

                    buyPart(part);

                }
            );

        }


        container.appendChild(
            item
        );

    });

}


/* =========================
   COMPRAR
========================= */

function buyPart(part) {

    if (
        ownedParts.includes(
            part.id
        )
    ) {

        return;

    }


    if (
        money < part.price
    ) {

        alert(
            "Dinheiro insuficiente para comprar esta peça."
        );

        return;

    }


    money -=
        part.price;


    ownedParts.push(
        part.id
    );


    renderShop();


    if (
        ownedParts.length ===
        computerParts.length
    ) {

        setTimeout(
            completeComputer,
            400
        );

    }

}


/* =========================
   FINALIZAR LOJA
========================= */

document
    .getElementById(
        "finishShopButton"
    )
    .addEventListener(
        "click",
        finishShop
    );


function finishShop() {

    const complete =
        ownedParts.length ===
        computerParts.length;


    if (complete) {

        completeComputer();

        return;

    }


    showGameOver(
        "Você não conseguiu comprar todas as peças do computador."
    );

}


/* =========================
   COMPUTADOR COMPLETO
========================= */

function completeComputer() {

    saveRecord();

    showRecordsAfterVictory();

}


/* =========================
   GAME OVER
========================= */

function showGameOver(message) {

    document
        .getElementById(
            "gameOverPlayer"
        )
        .textContent =
            playerName;


    document
        .getElementById(
            "gameOverDifficulty"
        )
        .textContent =
            difficulties[
                selectedDifficulty
            ].name;


    document
        .getElementById(
            "gameOverMoney"
        )
        .textContent =
            money;


    document
        .getElementById(
            "gameOverMessage"
        )
        .textContent =
            message;


    showScreen("gameOver");

}


/* =========================
   BOTÃO GAME OVER
========================= */

document
    .getElementById(
        "gameOverMenuButton"
    )
    .addEventListener(
        "click",
        () => {

            resetToStart();

        }
    );


/* =========================
   SALVAR RECORD
========================= */

function saveRecord() {

    const records =
        JSON.parse(

            localStorage.getItem(
                "snakePCRecords"
            ) || "[]"

        );


    records.push({

        name:
            playerName,

        difficulty:
            difficulties[
                selectedDifficulty
            ].name,

        money:
            money,

        date:
            new Date()
                .toLocaleDateString(
                    "pt-BR"
                )

    });


    records.sort(
        (a, b) =>
            b.money - a.money
    );


    const finalRecords =
        records.slice(
            0,
            20
        );


    localStorage.setItem(

        "snakePCRecords",

        JSON.stringify(
            finalRecords
        )

    );

}


/* =========================
   MOSTRAR RECORDS
========================= */

function renderRecords() {

    const container =
        document.getElementById(
            "recordsList"
        );


    const records =
        JSON.parse(

            localStorage.getItem(
                "snakePCRecords"
            ) || "[]"

        );


    container.innerHTML = "";


    if (
        records.length === 0
    ) {

        container.innerHTML = `

            <p style="
                text-align:center;
                color:#9ca3af;
                margin-bottom:20px;
            ">
                Nenhum recorde registrado.
            </p>

        `;

        return;

    }


    records.forEach(
        (record, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "record";


            element.innerHTML = `

                <span
                    class="record-position">

                    ${index + 1}

                </span>


                <span
                    class="record-name">

                    ${escapeHTML(
                        record.name
                    )}

                </span>


                <span
                    class="record-difficulty">

                    ${escapeHTML(
                        record.difficulty
                    )}

                </span>


                <span
                    class="record-money">

                    $${record.money}

                </span>

            `;


            container.appendChild(
                element
            );

        }
    );

}


/* =========================
   RECORDS APÓS VITÓRIA
========================= */

function showRecordsAfterVictory() {

    renderRecords();

    showScreen("records");

}


/* =========================
   VOLTAR PARA INÍCIO
========================= */

function resetToStart() {

    clearTimeout(gameTimer);

    clearInterval(
        bonusTimerInterval
    );


    gameRunning = false;

    gameFinished = false;

    money = 0;

    multiplier = 1;

    bonus = null;

    bonusTime = 0;

    ownedParts = [];

    snake = [];

    coins = [];


    document
        .getElementById(
            "playerName"
        )
        .value = "";


    showScreen("start");

}


/* =========================
   SEGURANÇA
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}