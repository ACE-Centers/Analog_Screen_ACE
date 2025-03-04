/**
 * makecode Four Digit Display (TM1650) Package.
 * From microbit/micropython Chinese community.
 */

/**
 * TM1650 digit Display
 */
//% weight=20 color=#585CA9 icon="8" block="Analog_Screen_ACE"
namespace Analog_Screen_ACE {

    let COMMAND_I2C_ADDRESS = 0x24
    let DISPLAY_I2C_ADDRESS = 0x34
    let _SEG = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    let TM1650_CDigits = [  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
                            0x00, 0x82, 0x21, 0x00, 0x00, 0x00, 0x00, 0x02, 0x39, 0x0F, 0x00, 0x00, 0x00, 0x40, 0x80, 0x00, 
                            0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7f, 0x6f, 0x00, 0x00, 0x00, 0x48, 0x00, 0x53,
                            0x00, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71, 0x6F, 0x76, 0x06, 0x1E, 0x00, 0x38, 0x00, 0x54, 0x3F,
                            0x73, 0x67, 0x50, 0x6D, 0x78, 0x3E, 0x00, 0x00, 0x00, 0x6E, 0x00, 0x39, 0x00, 0x0F, 0x00, 0x08,  
                            0x63, 0x5F, 0x7C, 0x58, 0x5E, 0x7B, 0x71, 0x6F, 0x74, 0x02, 0x1E, 0x00, 0x06, 0x00, 0x54, 0x5C, 
                            0x73, 0x67, 0x50, 0x6D, 0x78, 0x1C, 0x00, 0x00, 0x00, 0x6E, 0x00, 0x39, 0x30, 0x0F, 0x00, 0x00
                        ];

    let _intensity = 3
    let dbuf = [0, 0, 0, 0]
    let iPosition = ""

    /**
     * send command to display
     * @param is command, eg: 0
     */
    function cmd(c: number) {
        pins.i2cWriteNumber(COMMAND_I2C_ADDRESS, c, NumberFormat.Int8BE)
    }

    /**
     * send data to display
     * @param is data, eg: 0
     */
    function dat(bit: number, d: number) {
        pins.i2cWriteNumber(DISPLAY_I2C_ADDRESS + (bit % 4), d, NumberFormat.Int8BE)
    }

    /**
     * turn on display
     */
    //% blockId="TM650_ON" block="turn on display"
    //% weight=50 blockGap=8
    export function on() {
        cmd(_intensity * 16 + 1)
    }

    /**
     * turn off display
     */
    //% blockId="TM650_OFF" block="turn off display"
    //% weight=50 blockGap=8
    export function off() {
        _intensity = 0
        cmd(0)
    }

    /**
     * clear display content
     */
    //% blockId="TM650_CLEAR" block="clear display"
    //% weight=40 blockGap=8
    export function clear() {
        dat(0, 0)
        dat(1, 0)
        dat(2, 0)
        dat(3, 0)
        dbuf = [0, 0, 0, 0]
    }

    /**
     * show a digital in given position
     * @param digit is number (0-15) will be shown, eg: 1
     * @param bit is position, eg: 0
     */
    //% blockId="TM650_DIGIT" block="show digit %num|at %bit"
    //% weight=80 blockGap=8
    //% num.max=15 num.min=0
    export function digit(num: number, bit: number) {
        dbuf[bit % 4] = _SEG[num % 16]
        dat(bit, _SEG[num % 16])
    }

    /**
     * show a number in display
     * @param num is number will be shown, eg: 100
     */
    //% blockId="TM650_SHOW_NUMBER" block="show number %num"
    //% weight=100 blockGap=8
    export function showNumber(num: number) {
        if (num < 0) {
            dat(0, 0x40) // '-'
            num = -num
        }
        else
            digit(Math.idiv(num, 1000) % 10, 0)
        digit(num % 10, 3)
        digit(Math.idiv(num, 10) % 10, 2)
        digit(Math.idiv(num, 100) % 10, 1)
    }


    //% blockId="showSring" block="show string %str"
    //% weight=100 blockGap=8
    export function showSring(str: string) {
        for(let i = 0;i<4;i++)
        {
            let a = str.charCodeAt(i) & 0x7F;
            let dot = str.charCodeAt(i) & 0x80;
            dbuf[i] = TM1650_CDigits[a];
            if(a)
            {
                pins.i2cWriteNumber(DISPLAY_I2C_ADDRESS + i, dbuf[i] | dot, NumberFormat.Int8BE)
            }
            else
            {
                break;
            }

        }
    }


     function displayRuning(str: string,del: number):number {
        iPosition  = str;
        showSring(iPosition); 
        basic.pause(del); 
        let l = iPosition.length;
        
        if(l < 4)
        {
            return 0;
        }
        else
        {
            return (l - 4);
        }

    }

    function displayRunningShift():number {

        if(iPosition.length <= 4)
        {
            return 0;

        }
        else
        {
          iPosition = iPosition.substr(1,iPosition.length - 1);
          showSring(iPosition);
          return (iPosition.length - 4);
        }

    }

    //% blockId="showRunging" block="scroll display %str | rolling time(ms) %del"
    //% weight=90 blockGap=8
    export function showRunging(str: string,del: number) {
        if(displayRuning(str,del))
        {
            while(displayRunningShift())
            {
                basic.pause(del);
            }

        }


    }



    /**
     * show a number in hex format
     * @param num is number will be shown, eg: 123
     */
    //% blockId="TM650_SHOW_HEX_NUMBER" block="show hex number %num"
    //% weight=90 blockGap=8
    export function showHex(num: number) {
        if (num < 0) {
            dat(0, 0x40) // '-'
            num = -num
        }
        else
            digit((num >> 12) % 16, 0)
        digit(num % 16, 3)
        digit((num >> 4) % 16, 2)
        digit((num >> 8) % 16, 1)
    }

    /**
     * show Dot Point in given position
     * @param bit is positiion, eg: 0
     * @param show is true/false, eg: true
     */
    //% blockId="TM650_SHOW_DP" block="show dot point %bit|show %num"
    //% weight=80 blockGap=8
    export function showDpAt(bit: number, show: boolean) {
        if (show) dat(bit, dbuf[bit % 4] | 0x80)
        else dat(bit, dbuf[bit % 4] & 0x7F)
    }

    /**
     * set display intensity
     * @param dat is intensity of the display, eg: 3
     */
    //% blockId="TM650_INTENSITY" block="set intensity %dat"
    //% weight=70 blockGap=8
    export function setIntensity(dat: number) {
        if ((dat < 0) || (dat > 8))
            return;
        if (dat == 0)
            off()
        else {
            _intensity = dat
            cmd((dat << 4) | 0x01)
        }
    }

    on();
}
