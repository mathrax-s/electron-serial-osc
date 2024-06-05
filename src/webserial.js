// シリアル通信 関連
let port;
let serialPortList;
let portCustomNameList;

let reader;
let lineBuffer;
let latestData = [];  // この配列に受信データが入る

let inputDone;
let outputDone;
let inputStream;
let outputStream;

const updateSerialPort = async () => {
    try {
      let updateport = await navigator.serial.requestPort();
    } catch (e) {
  
    }
  }
  
  const connectSerialPort = async () => {
    const filters = [
      { usbVendorId: 0x0d28, usbProductId: 0x0204 } 	//micro:bit ID.
    ];
  
    const options = {
      baudRate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: 'none',
    };
  
    port = null;
    latestData = null;
    try {
      port = await navigator.serial.requestPort();
    }
    catch (e) {
      return
    }
  
    try {
      await port.open(options);
    }
    catch (e) {
      return
    }
    // CODELAB: Add code setup the output stream here.
    const encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;
  
  
    // CODELAB: Add code to read the stream here.
    let decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable;
  
    reader = inputStream.getReader();
    readLoop();
  }
  
  const disconnectSerialPort = async () => {
    // CODELAB: Close the input stream (reader).
    if (reader) {
      await reader.cancel();
      await inputDone.catch(() => { });
      reader = null;
      inputDone = null;
    }
    // CODELAB: Close the output stream.
    if (outputStream) {
      await outputStream.getWriter().close();
      await outputDone;
      outputStream = null;
      outputDone = null;
    }
    // CODELAB: Close the port.
    await port.close();
    port = null;
  }
  
  /**
   * @name readLoop
   * Reads data from the input stream and displays it on screen.
   */
  const readLoop = async () => {
    // CODELAB: Add read loop here.
    while (true) {
      const {
        value,
        done
      } = await reader.read();
      if (value) {
        lineBuffer += value;
        let lines = lineBuffer.split('\n');
  
        if (lines.length > 0) {
          latestData = lineBuffer.trim().split(',');
          lineBuffer = lines.pop().trim();
          // app.checkData(latestData.toString('utf-8'));
          app.checkData(latestData);
  
        }
      }
      if (done) {
        reader.releaseLock();
        break;
      }
    }
  }
  
  const writeToStream = (...lines) => {
    // CODELAB: Write to output stream
    const writer = outputStream.getWriter();
    lines.forEach((line) => {
      console.log('[SEND]', line);
      writer.write(line + '\n');
    });
    writer.releaseLock();
  }
  
  const getSerialList = (port_info) => {
    serialPortList = JSON.parse(port_info);
    // console.log(serialPortList);
    portCustomNameList = [];
  
    for (let i = 0; i < serialPortList.length; i++) {
      let sp = '';
      sp += serialPortList[i].portName;
      if (serialPortList[i].displayName != null) {
        sp += (' (' + serialPortList[i].displayName + ')');
      }
      app.setDropdownOption(sp);
      portCustomNameList[i] = sp;
      // console.log("port " + i + ":" + sp);
    }
  
  }
  
  window.api.GetPort((arg) => getSerialList(arg));