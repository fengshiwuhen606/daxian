const solarSystemContainer = document.getElementById('solar-system-container');
const gameContainer = document.getElementById('game-container');
const planets = document.querySelectorAll('.planet');

const planetBackgrounds = {
    mercury: 'picture/生成太阳系图片.png',
    venus: 'picture/生成太阳系图片 (1).png',
    earth: 'picture/生成太阳系图片 (2).png',
    mars: 'picture/生成太阳系图片 (3).png',
    jupiter: 'picture/生成太阳系图片 (4).png',
    saturn: 'picture/生成太阳系图片 (5).png',
    uranus: 'picture/生成太阳系图片 (7).png',
    neptune: 'picture/生成太阳系图片 (6).png'
};

planets.forEach(planet => {
    planet.addEventListener('click', () => {
        const planetId = planet.id;
        solarSystemContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        gameContainer.style.backgroundImage = `url('${planetBackgrounds[planetId]}')`;
        startGame();
    });
});

function startGame() {
    let numEnemies = 3; // 初始小兵数量

    // 创建随机位置的小兵
    function createEnemies() {
        const enemies = [];
        for (let i = 0; i < numEnemies; i++) {
            const x = Math.floor(Math.random() * (800 - 20));
            const y = Math.floor(Math.random() * (600 - 20));
            const enemyElement = document.createElement('img');
            enemyElement.classList.add('enemy');
            enemyElement.src = 'picture/陨石.png'; // 小兵图片地址，可替换为自己的图片
            enemyElement.style.left = x + 'px';
            enemyElement.style.top = y + 'px';
            gameContainer.appendChild(enemyElement);
            enemies.push({
                element: enemyElement,
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                currentDirectionIndex: 0,
                directionSequence: ['up', 'right', 'down', 'left']
            });
        }
        return enemies;
    }

    let enemies = createEnemies();

    // 创建玩家图片元素
    const player1 = document.createElement('img');
    player1.id = 'player1';
    player1.src = 'picture/飞碟.png'; // 这里可以替换为你自己的图片地址
    gameContainer.appendChild(player1);

    const player2 = document.createElement('img');
    player2.id = 'player2';
    player2.src = 'picture/飞碟.png'; // 这里可以替换为你自己的图片地址
    gameContainer.appendChild(player2);

    // 创建攻击直线
    const attackLine1 = document.createElement('div');
    attackLine1.classList.add('attack-line');
    gameContainer.appendChild(attackLine1);
    const attackLine2 = document.createElement('div');
    attackLine2.classList.add('attack-line');
    gameContainer.appendChild(attackLine2);

    let x1 = 25;
    let y1 = 25;
    let x2 = 750;
    let y2 = 550;
    const step = 5;
    const enemyStep = 1;
    const moveRadius = 50;
    let isAttacking1 = false;
    let isAttacking2 = false;
    let lastDirection1 = 'right';
    let lastDirection2 = 'right';

    function isOverlapping(x1, y1, x2, y2) {
        return (
            x1 < x2 + 20 &&
            x1 + 20 > x2 &&
            y1 < y2 + 20 &&
            y1 + 20 > y2
        );
    }

    function isAttackHittingEnemy(attackLine, enemy) {
        const rect1 = attackLine.getBoundingClientRect();
        const rect2 = enemy.element.getBoundingClientRect();
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    function isCollidingWithEnemy(x, y) {
        return enemies.some(enemy => {
            return isOverlapping(x, y, enemy.x, enemy.y);
        });
    }

    function restartGame(isFailure) {
        x1 = 25;
        y1 = 25;
        x2 = 750;
        y2 = 550;
        player1.style.left = x1 + 'px';
        player1.style.top = y1 + 'px';
        player2.style.left = x2 + 'px';
        player2.style.top = y2 + 'px';

        // 移除剩余小兵元素
        enemies.forEach(enemy => {
            enemy.element.remove();
        });

        if (isFailure) {
            numEnemies = 3; // 失败时重置小兵数量为 3
        } else {
            numEnemies++; // 胜利时小兵数量加 1
        }
        // 重新创建小兵
        enemies = createEnemies();
    }

    function moveEnemy(enemy) {
        const currentDirection = enemy.directionSequence[enemy.currentDirectionIndex];
        let newX = enemy.x;
        let newY = enemy.y;

        switch (currentDirection) {
            case 'up':
                newY = enemy.y - enemyStep;
                if (newY < 0) {
                    enemy.currentDirectionIndex = (enemy.currentDirectionIndex + 1) % enemy.directionSequence.length;
                    return;
                }
                break;
            case 'right':
                newX = enemy.x + enemyStep;
                if (newX > 800 - 20) {
                    enemy.currentDirectionIndex = (enemy.currentDirectionIndex + 1) % enemy.directionSequence.length;
                    return;
                }
                break;
            case 'down':
                newY = enemy.y + enemyStep;
                if (newY > 600 - 20) {
                    enemy.currentDirectionIndex = (enemy.currentDirectionIndex + 1) % enemy.directionSequence.length;
                    return;
                }
                break;
            case 'left':
                newX = enemy.x - enemyStep;
                if (newX < 0) {
                    enemy.currentDirectionIndex = (enemy.currentDirectionIndex + 1) % enemy.directionSequence.length;
                    return;
                }
                break;
        }

        const distanceX = Math.abs(newX - enemy.originalX);
        const distanceY = Math.abs(newY - enemy.originalY);
        if (distanceX <= moveRadius && distanceY <= moveRadius) {
            enemy.x = newX;
            enemy.y = newY;
            enemy.element.style.left = newX + 'px';
            enemy.element.style.top = newY + 'px';
        } else {
            enemy.currentDirectionIndex = (enemy.currentDirectionIndex + 1) % enemy.directionSequence.length;
        }
    }

    const keys = {};
    document.addEventListener('keydown', function (event) {
        keys[event.key] = true;
        if (event.key === 'w') lastDirection1 = 'up';
        if (event.key === 's') lastDirection1 = 'down';
        if (event.key === 'a') lastDirection1 = 'left';
        if (event.key === 'd') lastDirection1 = 'right';
        if (event.key === 'ArrowUp') lastDirection2 = 'up';
        if (event.key === 'ArrowDown') lastDirection2 = 'down';
        if (event.key === 'ArrowLeft') lastDirection2 = 'left';
        if (event.key === 'ArrowRight') lastDirection2 = 'right';

        if (event.key === ' ' && !isAttacking1) {
            isAttacking1 = true;
            let length = 200;
            let width = 10;
            switch (lastDirection1) {
                case 'up':
                    let top1 = Math.max(y1 - length, 0);
                    length = y1 - top1;
                    attackLine1.style.left = (x1 + 5) + 'px';
                    attackLine1.style.top = top1 + 'px';
                    attackLine1.style.width = width + 'px';
                    attackLine1.style.height = length + 'px';
                    break;
                case 'down':
                    let bottom1 = Math.min(y1 + 20 + length, 600);
                    length = bottom1 - (y1 + 20);
                    attackLine1.style.left = (x1 + 5) + 'px';
                    attackLine1.style.top = (y1 + 20) + 'px';
                    attackLine1.style.width = width + 'px';
                    attackLine1.style.height = length + 'px';
                    break;
                case 'left':
                    let left1 = Math.max(x1 - length, 0);
                    length = x1 - left1;
                    attackLine1.style.left = left1 + 'px';
                    attackLine1.style.top = (y1 + 5) + 'px';
                    attackLine1.style.width = length + 'px';
                    attackLine1.style.height = width + 'px';
                    break;
                case 'right':
                    let right1 = Math.min(x1 + 20 + length, 800);
                    length = right1 - (x1 + 20);
                    attackLine1.style.left = (x1 + 20) + 'px';
                    attackLine1.style.top = (y1 + 5) + 'px';
                    attackLine1.style.width = length + 'px';
                    attackLine1.style.height = width + 'px';
                    break;
            }
            attackLine1.style.display = 'block';
            setTimeout(() => {
                isAttacking1 = false;
                attackLine1.style.display = 'none';
            }, 300);
        }
        if (event.key === 'Enter' && !isAttacking2) {
            isAttacking2 = true;
            let length = 200;
            let width = 10;
            switch (lastDirection2) {
                case 'up':
                    let top2 = Math.max(y2 - length, 0);
                    length = y2 - top2;
                    attackLine2.style.left = (x2 + 5) + 'px';
                    attackLine2.style.top = top2 + 'px';
                    attackLine2.style.width = width + 'px';
                    attackLine2.style.height = length + 'px';
                    break;
                case 'down':
                    let bottom2 = Math.min(y2 + 20 + length, 600);
                    length = bottom2 - (y2 + 20);
                    attackLine2.style.left = (x2 + 5) + 'px';
                    attackLine2.style.top = (y2 + 20) + 'px';
                    attackLine2.style.width = width + 'px';
                    attackLine2.style.height = length + 'px';
                    break;
                case 'left':
                    let left2 = Math.max(x2 - length, 0);
                    length = x2 - left2;
                    attackLine2.style.left = left2 + 'px';
                    attackLine2.style.top = (y2 + 5) + 'px';
                    attackLine2.style.width = length + 'px';
                    attackLine2.style.height = width + 'px';
                    break;
                case 'right':
                    let right2 = Math.min(x2 + 20 + length, 800);
                    length = right2 - (x2 + 20);
                    attackLine2.style.left = (x2 + 20) + 'px';
                    attackLine2.style.top = (y2 + 5) + 'px';
                    attackLine2.style.width = length + 'px';
                    attackLine2.style.height = width + 'px';
                    break;
            }
            attackLine2.style.display = 'block';
            setTimeout(() => {
                isAttacking2 = false;
                attackLine2.style.display = 'none';
            }, 300);
        }

        // 按ESC键退出游戏

    });
    document.addEventListener('keyup', function (event) {
        keys[event.key] = false;
    });

    function moveBoxes() {
        let newX1 = x1;
        let newY1 = y1;
        let newX2 = x2;
        let newY2 = y2;

        if (keys['w']) {
            newY1 = Math.max(y1 - step, 0);
        } else if (keys['s']) {
            newY1 = Math.min(y1 + step, 600 - 20);
        }
        if (keys['a']) {
            newX1 = Math.max(x1 - step, 0);
        } else if (keys['d']) {
            newX1 = Math.min(x1 + step, 800 - 20);
        }

        if (keys['ArrowUp']) {
            newY2 = Math.max(y2 - step, 0);
        } else if (keys['ArrowDown']) {
            newY2 = Math.min(y2 + step, 600 - 20);
        }
        if (keys['ArrowLeft']) {
            newX2 = Math.max(x2 - step, 0);
        } else if (keys['ArrowRight']) {
            newX2 = Math.min(x2 + step, 800 - 20);
        }

        if (!isOverlapping(newX1, newY1, x2, y2)) {
            x1 = newX1;
            y1 = newY1;
        }

        if (!isOverlapping(x1, y1, newX2, newY2)) {
            x2 = newX2;
            y2 = newY2;
        }

        if (isCollidingWithEnemy(x1, y1) || isCollidingWithEnemy(x2, y2)) {
            restartGame(true); // 游戏失败
        }

        player1.style.left = x1 + 'px';
        player1.style.top = y1 + 'px';
        player2.style.left = x2 + 'px';
        player2.style.top = y2 + 'px';

        // 处理攻击
        if (isAttacking1) {
            enemies.forEach((enemy, index) => {
                if (isAttackHittingEnemy(attackLine1, enemy)) {
                    enemy.element.remove();
                    enemies.splice(index, 1);
                }
            });
        }
        if (isAttacking2) {
            enemies.forEach((enemy, index) => {
                if (isAttackHittingEnemy(attackLine2, enemy)) {
                    enemy.element.remove();
                    enemies.splice(index, 1);
                }
            });
        }

        // 移动小兵
        enemies.forEach(moveEnemy);

        // 检查小兵是否全部被消灭
        if (enemies.length === 0) {
            restartGame(false); // 游戏胜利
        }

        requestAnimationFrame(moveBoxes);
    }

    moveBoxes();
}
