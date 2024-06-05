const MICROBIT = 1;     //microbitなら、センサ3つで、−1024~1024を0~100にする
const max_sensor = 15;  //3,6,9,15個を想定

let MAX = max_sensor;
let col;
let id;
let vcc1 = 0;
let vcc2 = 0;
let vcc3 = 0;
let microbit_data = [0];
let xyz = [0, 0, 0];
let s_count = 0;
let m_col = [];

// p5js
const s = (p) => {
  let dropDownList;
  let button = [];
  let buttonName = ['ポート更新', '接続', '切断'];
  let nowSelect = null;
  let lastSelect = null;
  let lastPortName = null;
  let st;
  let m_col = [
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200),
    p.color(200, 100, 100), p.color(100, 200, 100), p.color(100, 100, 200)
  ];
  let osc_rcv_data;
  let transparent = 0.0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < 3; i++) {
      button[i] = p.createButton(buttonName[i]);
      button[i].position(240 + 60 * i, 30);
      button[i].size(60, 60);
    }

    button[0].mousePressed(p.updatePortButton);
    button[1].mousePressed(p.connectPortButton);
    button[2].mousePressed(p.disconnectPortButton);

    dropDownList = p.createSelect();
    dropDownList.position(30, 40);
    dropDownList.size(170, 30);
    dropDownList.option('select...');
    dropDownList.selected('select...');

    // ドロップダウン項目が選択されたときに呼ばれる関数のはずだけど
    // シリアル通信と一緒に使うと呼ばれないときがあるので
    // drawのなかで、項目のチェックを行うことにしています
    // dropDownList.changed(p.dropdownChecking);

    col = p.color(255, 200, 100);

    //起動時
    st = 0;
    button[0].removeAttribute('disabled', '');
    button[1].attribute('disabled', '');
    button[2].attribute('disabled', '');
    dropDownList.attribute('disabled', '');

    //
    if (MICROBIT === 1) {
      MAX = 3;
      p.resizeCanvas(p.windowWidth, 300);
      //MICROBITのとき、ウィンドウサイズを高さ300にする
      window.api.SetMicrobit(300);
    } else {
      MAX = max_sensor;
      p.resizeCanvas(p.windowWidth, 520);
      //MICROBITのとき、ウィンドウサイズを高さ300にする
      window.api.SetMicrobit(520);
    }
    for (let i = 0; i < MAX; i++) {
      microbit_data[i] = 0;
    }
  }

  p.draw = () => {
    p.background(col);
    //ドロップダウン項目の選択されたものをチェック
    p.dropdownChecking();

    //センサ情報を格納する
    for (let i = 0; i < MAX; i++) {
      if (MICROBIT === 1) {
        xyz[i] = p.constrain(p.map(microbit_data[i], -1024, 1024, 0, 100), 0, 100);
      } else {
        xyz[i] = p.constrain(p.map(microbit_data[i], 0, 255, 0, 100), 0, 100);
      }
    }

    let xpos = 50;
    let ypos = 120;

    p.textAlign(p.LEFT, p.CENTER);
    p.fill(50, 50, 100);
    p.textSize(14);
    p.text("Serial", xpos, ypos);
    if (st == 0 || st == 1) {
      p.fill(50, 50, 100, 100);
    } else {
      p.fill(50, 50, 100, 200);
    }
    p.textSize(10);
    p.text("115200 bps", xpos, ypos + 15);

    p.fill(50, 50, 100);
    p.textSize(14);
    p.text("OSC", 50, ypos + 45);
    if (st == 0 || st == 1) {
      p.fill(50, 50, 100, 100);
    } else {
      p.fill(50, 50, 100, 200);
    }
    p.textSize(10);
    p.text("send port : 4560 and 9999", xpos, ypos + 60);
    p.text("receive port : 3333", xpos, ypos + 75);

    if (p.frameCount % 1 == 0) {
      // OSCのAPI(preload.jsでcontextBridgeとして定義)
      const oscAPI = window.api;
      p.rectMode(p.CORNER);
      p.textSize(10);

      for (let iy = 0; iy < MAX / 3; iy++) {
        if (st == 0 || st == 1) {
          m_col[iy * 3 + 0].setAlpha(100);
          m_col[iy * 3 + 1].setAlpha(100);
          m_col[iy * 3 + 2].setAlpha(100);
        } else {
          m_col[iy * 3 + 0].setAlpha(200);
          m_col[iy * 3 + 1].setAlpha(200);
          m_col[iy * 3 + 2].setAlpha(200);
        }

        p.noStroke();
        p.fill(100, 100, 100, 50);
        p.rect(50 + 120 * 0, ypos + 130 + 50 * iy, 100, 10);
        p.rect(50 + 120 * 1, ypos + 130 + 50 * iy, 100, 10);
        p.rect(50 + 120 * 2, ypos + 130 + 50 * iy, 100, 10);

        p.fill(m_col[iy * 3 + 0]);
        p.text(p.int(xyz[iy * 3 + 0]), 50 + 120 * 0, ypos + 150 + 50 * iy);
        p.fill(m_col[iy * 3 + 1]);
        p.text(p.int(xyz[iy * 3 + 1]), 50 + 120 * 1, ypos + 150 + 50 * iy);
        p.fill(m_col[iy * 3 + 2]);
        p.text(p.int(xyz[iy * 3 + 2]), 50 + 120 * 2, ypos + 150 + 50 * iy);

        p.fill(m_col[iy * 3 + 0]);
        p.rect(50 + 120 * 0, ypos + 130 + 50 * iy, xyz[iy * 3 + 0], 10);
        p.fill(m_col[iy * 3 + 1]);
        p.rect(50 + 120 * 1, ypos + 130 + 50 * iy, xyz[iy * 3 + 1], 10);
        p.fill(m_col[iy * 3 + 2]);
        p.rect(50 + 120 * 2, ypos + 130 + 50 * iy, xyz[iy * 3 + 2], 10);
      }
      if (st == 2) {
        // OSCデータを送信する
        let slist = [];
        for (let i = 0; i < MAX; i++) {
          slist[i] = p.int(xyz[i]);
        }
        oscAPI.send('/sensor', slist);
      }
    }
    p.fill(100, 100, 100, 100 * transparent);
    transparent *= 0.9;
    p.ellipse(40, 240, 10, 10);
    p.text(osc_rcv_data, 170, 240);
  }

  //ドロップダウン項目の追加
  //このとき前回選んだ項目があれば、それを選択する
  p.setDropdownOption = (_op) => {
    dropDownList.option(_op);

    //最後に選んだ項目があれば、
    if (lastPortName != null) {
      //最後に選んだ項目を、自動的に選択する
      //（切断するたびに何度もドロップダウンで選ぶ手間を省くため）
      dropDownList.selected(lastPortName);
    }
  }

  //ドロップダウン項目をチェックする
  p.dropdownChecking = () => {
    nowSelect = dropDownList.value();
    //もし以前に選んだ項目とちがうときは、
    if (nowSelect != lastSelect) {
      //ポート選択情報もアップデートする
      p.portSelectUpdate();
      lastSelect = nowSelect;
    }
  }

  //シリアルポート
  //ポートの更新
  p.updatePortButton = () => {
    p.updatePort();
  }

  p.updatePort = async () => {
    //ドロップダウンとシリアル通信と一緒に使うと、
    //ドロップダウンが機能しなくなるので
    //やむなく強引に解決したもので、
    //いったんremoveして、新しく生成することにしています
    dropDownList.remove()

    dropDownList = p.createSelect();
    dropDownList.position(30, 40);
    dropDownList.size(170, 30);
    dropDownList.option('select...');

    //updateSerialPort()で、
    //main.jsに、シリアルポートのリクエストを行い、
    //返ってくる情報から、ドロップダウンの項目をつくります
    await updateSerialPort();
  }

  //ポート選択情報をアップデートする
  p.portSelectUpdate = () => {
    if (nowSelect != null) {
      //選んだポート名が、JSONにあるとき、そのJSONをメインに送る
      if ((nowSelect != 'select...')) {
        let index = null;
        for (let i = 0; i < serialPortList.length; i++) {
          if (serialPortList != null) {
            //今選んだドロップダウン項目に、portNameが含まれているかどうかチェック
            let result = nowSelect.indexOf(serialPortList[i].portName);
            if (result !== -1) {
              index = i;
              // console.log("index : "+i)
            }
          }
        }
        if (index != null) {
          const sendData = serialPortList[index];

          if (st === 0) {
            st = 1;
            button[0].removeAttribute('disabled', '');
            button[1].removeAttribute('disabled', '');
            button[2].attribute('disabled', '');
            dropDownList.attribute('disabled', '');
          }
          //main.jsに、選んだポートのJSONを送信する
          window.api.SetPort(sendData);
          //いま選んだポートの名前をlastPortNameに格納
          //（ドロップダウンの項目を追加するとき、
          // lastPortNameが存在すればそれを選ぶようにするため）
          lastPortName = portCustomNameList[index];
        }
      }
    }
  }

  //ポートの接続
  p.connectPortButton = async () => {
    //ポートが使われていたら切断する
    if (port) {
      await disconnectSerialPort();
      port = null;
    }
    //シリアルポートと接続する
    await connectSerialPort();
    p.updatePort();
    st = 2;
    button[0].attribute('disabled', '');
    button[1].attribute('disabled', '');
    button[2].removeAttribute('disabled', '');
    dropDownList.attribute('disabled', '');
  }

  //ポートの切断
  p.disconnectPortButton = async () => {
    //ポートが使われていたら切断する
    if (port != null) {
      await disconnectSerialPort();
    }

    st = 3;
    button[0].removeAttribute('disabled', '');
    button[1].removeAttribute('disabled', '');
    button[2].attribute('disabled', '');
    dropDownList.attribute('disabled', '');
  }

  p.checkData = async (_data) => {
    for (let i = 0; i < MAX; i++) {
      if (!Number.isNaN(_data[i])) {
        microbit_data[i] = parseInt(_data[i], 10);
      }
    }
  }

  // OSCデータを受信すると呼ばれる関数
  p.oscReceive = (msg) => {
    if (msg != null) {
      // OSCのAPI(preload.jsでcontextBridgeとして定義)
      const oscAPI = window.api;
      // OSCアドレスが一致する場合、dataが入る
      let data = oscAPI.receive("/test", msg);
      osc_rcv_data = data;
      transparent = 1.0;
      // x = data[0];
      // y = data[1];
      // console.log(data);
    }
  }

}

// const container = document.getElementById('container');
const app = new p5(s, container);

// OSCを受信したら、p5のoscReceive関数に渡す
window.api.getRcv((arg) => app.oscReceive(arg));