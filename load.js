const $ = require("jquery");
let score = 0;
const H = 15;
const W = 9;
const SZ = 30;
const BLOCK_COUNT = 7;
const blocksx = [
    [[0, 0, 0, 0], [0, 1, 1, 1], [1, 0, 1, 1], [1, 1, 0, 1], [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]]
];
const blocksy = [
    [[0, 1, 2, 3], [0, 0, 1, 2], [0, 1, 1, 2], [0, 1, 2, 2], [0, 1, 0, 1], [0, 1, 1, 2], [1, 2, 0, 1]]
];
let cbx, cby, cbidx, cbrot;
const getRotatePos = () => {
    for (let i = 1; i < 4; i++) {
        const rotsx = [];
        const rotsy = [];
        for (let j = 0; j < BLOCK_COUNT; j++) {
            const curx = [];
            const cury = [];
            for (let k = 0; k < 4; k++) {
                curx.push(3 - blocksy[i - 1][j][k]);
                cury.push(blocksx[i - 1][j][k]);
            }
            rotsx.push(curx);
            rotsy.push(cury);
        }
        blocksx.push(rotsx);
        blocksy.push(rotsy);
    }
};
let actions = [];
const createNewBlock = () => {
    cbx = 0;
    cby = 3;
    cbidx = parseInt(Math.random() * BLOCK_COUNT);
    // cbidx = 1;
    cbrot = 0;
    const finished = canPut(cbx, cby, cbidx, cbrot, blocks);
    if (!finished) return finished;
    const acts = getOptimised();
    console.log(acts.y, acts.rot, cbidx);
    if (acts.y != -10) {
        for (let i = 0; i < acts.rot; i++)
            actions.push('w');
        if (acts.y < cby) {
            for (let i = acts.y; i < cby; i++)
                actions.push('a');
        }
        else {
            for (let i = cby; i < acts.y; i++)
                actions.push('d');
        }
        actions.push('s');
    }
    else {
        actions = [];
    }
    return finished;
};
const create2dArray = (x, y) => {
    const arr = new Array(x);
    for (let i = 0; i < x; i++) {
        arr[i] = new Array(y);
    }
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
};
const copy2dArray = (arr) => {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        res.push(arr[i].slice());
    }
    return res;
}
const canPut = (x, y, idx, rot, b) => {
    for (let i = 0; i < 4; i++) {
        const cx = x + blocksx[rot][idx][i];
        const cy = y + blocksy[rot][idx][i];
        if (cx < 0 || cx >= H) return false;
        if (cy < 0 || cy >= W) return false;
        if (b[cx][cy] > 0)
            return false;
    }
    return true;
};
const put = (x, y, idx, rot, b) => {
    for (let i = 0; i < 4; i++) {
        const cx = x + blocksx[rot][idx][i];
        const cy = y + blocksy[rot][idx][i];
        b[cx][cy] = idx + 1;
    }
};
const show = (b) => {
    const tb = copy2dArray(b);
    for (let i = 1; i < BLOCK_COUNT + 1; i++) {
        $(".block").removeClass(`btype${i}`);
    }
    put(cbx, cby, cbidx, cbrot, tb);
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            $(`#block_${i}_${j}`).addClass(`btype${tb[i][j]}`);
        }
    }
    $("#score").text(score);
};
const initPad = () => {
    $("#cont").css("width", W * SZ + "px").css("height", H * SZ + "px");
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const block = $(`
                <div class="block" id="block_${i}_${j}"></div>
            `);
            block.css("left", j * SZ + 1 + "px").css("top", i * SZ + 1 + "px");
            $("#cont").append(block);
        }
    }
    $(".block").css("width", SZ - 2 + "px").css("height", SZ - 2 + "px");
};
let blocks;
const removeLine = (idx, b) => {
    for (let i = idx; i > 0; i--) {
        for (let j = 0; j < W; j++) {
            b[i][j] = b[i - 1][j];
        }
    }
    for (let i = 0; i < W; i++)
        b[0][i] = 0;
}
const removeBlocks = (b) => {
    let cnt = 0;
    for (let i = 0; i < H; i++) {
        let pss = true;
        for (let j = 0; j < W; j++) {
            if (b[i][j] == 0) {
                pss = false;
                break;
            }
        }
        if (pss) {
            removeLine(i, b);
            cnt++;
        }
    }
    return cnt;
};
const moveDown = () => {
    if (canPut(cbx + 1, cby, cbidx, cbrot, blocks))
        cbx++;
    else {
        put(cbx, cby, cbidx, cbrot, blocks);
        score += removeBlocks(blocks);
        // return true;
        if (!createNewBlock()) {
            return false;
        }
    }
    return true;
}
const moveLeft = () => {
    if (canPut(cbx, cby - 1, cbidx, cbrot, blocks)) {
        cby--;
        show(blocks);
        return true;
    }
    show(blocks);
    return false;
};
const moveRight = () => {
    if (canPut(cbx, cby + 1, cbidx, cbrot, blocks)) {
        cby++;
        show(blocks);
        return true;
    }
    show(blocks);
    return false;
};
const drop = () => {
    while (canPut(cbx + 1, cby, cbidx, cbrot, blocks))
        cbx++;
    moveDown();
    show(blocks);
};
const rotate = () => {
    if (canPut(cbx, cby, cbidx, (cbrot + 1) % 3, blocks)) {
        cbrot = (cbrot + 1) % 4;
        show(blocks);
        return true;
    }
    show(blocks);
    return false;
}
let interval = 500;
let aiinterval = 200;
let tmid;
let aitmid;
const runAction = (k) => {
    if ($("#control_pad").css("display") == "flex")
        return;
    if (k == 'a') {
        moveLeft();
    }
    else if (k == 'd') {
        moveRight();
    }
    else if (k == 'w') {
        rotate();
    }
    else if (k == 's') {
        drop();
        initTimer();
        show(blocks);
    }
}
const initTimer = () => {
    clearInterval(tmid);
    tmid = setInterval(() => {
        const finished = !moveDown();
        show(blocks);
        if (finished) {
            clearInterval(tmid);
            $("#control_pad").css("display", "flex");
            $("#score_result").text(`得分为${score}`);
        }
    }, interval);
};

initPad();
getRotatePos();

const getMark = (b) => {
    const removed = removeBlocks(b);
    let maxh = 0;
    for (let i = 0; i < H; i++) {
        let has = false;
        for (let j = 0; j < W; j++) {
            if (b[i][j] > 0) {
                has = true;
                break;
            }
        }
        if (has) {
            maxh = H - i;
            break;
        }
    }
    let isocnt = 0;
    for (let i = 0; i < W; i++) {
        let started = false;
        for (j = 0; j < H; j++) {
            if (b[j][i] > 0) started = true;
            if (b[j][i] == 0 && started)
                isocnt++;
        }
    }
    let xtrans = 0;
    for (let i = H - maxh; i < H; i++) {
        let pre = 1;
        for (let j = 0; j < W; j++) {
            if (pre > 0 && b[i][j] == 0) {
                xtrans++;
                pre = 0;
                continue;
            }
            if (pre == 0 && b[i][j] > 0) {
                xtrans++;
                pre = 1;
            }
        }
        if (b[i][W - 1] == 0)
            xtrans++;
    }
    let ytrans = 0;
    for (let i = 0; i < W; i++) {
        let pre = 1;
        for (let j = 0; j < H; j++) {
            if (pre > 0 && b[j][i] == 0) {
                ytrans++;
                pre = 0;
                continue;
            }
            if (pre == 0 && b[j][i] > 0) {
                ytrans++;
                pre = 1;
            }
        }
        if (b[H - 1][i] == 0)
            ytrans++;
    }
    const wells = create2dArray(H, W);
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (b[i][j] == 0 && (j == 0 || b[i][j - 1] > 0) && (j == W - 1 || b[i][j + 1] > 0)) {
                for (let k = 0; ; k++) {
                    if (i - k < 0) break;
                    if (b[i - k][j] == 0 && (j == 0 || b[i - k][j - 1] > 0) && (j == W - 1 || b[i - k][j + 1] > 0)) {
                        wells[i - k][j]++;
                    }
                    else
                        break;
                }
            }
        }
    }
    let welc = 0;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            welc += wells[i][j];
        }
    }
    console.log('maxh', maxh, 'removed', removed, 'xtrans', xtrans, 'ytrans', ytrans, 'isocnt', isocnt, 'welc', welc);
    const score = -maxh * 4.50 + removed * 3.41 - xtrans * 3.21 - ytrans * 9.34 - isocnt * 7.89 - welc * 3.38;
    // const score = -maxh * 4.50 + removed * 3.41 - isocnt * 7.89;
    return score;
};

const getResult = (rot, y, b) => {
    const tb = copy2dArray(b);
    if (!canPut(0, y, cbidx, rot, tb))
        return -10000;
    let x = 0;
    while (canPut(x, y, cbidx, rot, tb))
        x++;
    x--;
    put(x, y, cbidx, rot, tb);
    return getMark(tb);
}

const getOptimised = () => {
    let my = -10, mr = -1, mval = 1000, mmov = -1;
    for (let y = -3; y < W + 4; y++) {
        for (let r = 0; r < 4; r++) {
            const curv = getResult(r, y, blocks);
            if (curv == -10000) continue;
            console.log('-', y, r, cbidx, curv);
            const cm = Math.abs(y - cby) + r;
            if (mval == 1000 || mval < curv || (mval == curv && mmov > cm)) {
                my = y;
                mr = r;
                mval = curv;
                mmov = cm;
            }
        }
    }
    return {
        y: my,
        rot: mr
    }
};

$("#start").click(() => {
    score = 0;
    $("#cont").css("display", "block");
    $("#control_pad").css("display", "none");
    blocks = create2dArray(H, W);
    createNewBlock();
    show(blocks);
    initTimer();
    clearInterval(aitmid);
    aitmid = setInterval(() => {
        if (actions.length) {
            runAction(actions[0]);
            actions = actions.slice(1, actions.length);
        }
    }, aiinterval);
});