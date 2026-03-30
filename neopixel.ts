/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
enum NeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 0,
    //% block="RGB+W"
    RGBW = 1,
    //% block="RGB (RGB format)"
    RGB_RGB = 2
}

/**
 * Functions to operate NeoPixel strips.
 */
//% weight=5 color=#2699BF icon="\uf110"
namespace neopixel {

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: NeoPixelMode;

        /**
         * Shows all LEDs to a given color. 
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_strip_color" block="%strip|show color %rgb=neopixel_colors" 
        //% weight=85 blockGap=8
        //% parts="neopixel"
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a rainbow pattern on all LEDs. 
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="neopixel_set_strip_rainbow" block="%strip|show rainbow from %startHue|to %endHue" 
        //% weight=85 blockGap=8
        //% parts="neopixel"
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;

            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStep = Math.idiv((hDistCW * 100), steps);
            
            const h1_100 = h1 * 100;

            if (steps === 1) {
                this.setPixelColor(0, hsl(h1, saturation, luminance))
            } else {
                for (let i = 0; i < steps; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    this.setPixelColor(i, hsl(h, saturation, luminance));
                }
            }
            this.show();
        }

        /**
         * Set LED to a given color. 
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors" 
        //% blockGap=8
        //% weight=80
        //% parts="neopixel"
        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        /**
         * For NeoPixels with RGB+W LEDs, set the white LED brightness.
         * @param pixeloffset position of the LED in the strip
         * @param white brightness of the white LED
         */
        //% blockId="neopixel_set_pixel_white" block="%strip|set pixel white LED at %pixeloffset|to %white" 
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" advanced=true
        setPixelWhiteLED(pixeloffset: number, white: number): void {
            if (this._mode === NeoPixelMode.RGBW) {
                this.setPixelW(pixeloffset >> 0, white >> 0);
            }
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="neopixel_show" block="%strip|show" blockGap=8
        //% weight=79
        //% parts="neopixel"
        show() {
            // Universal driver for V1 and V2
            light.sendWS2812Buffer(this.buf, this.pin);
        }

        /**
         * Turn off all LEDs.
         */
        //% blockId="neopixel_clear" block="%strip|clear"
        //% weight=76
        //% parts="neopixel"
        clear(): void {
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Set the brightness of the strip (0-255).
         * @param brightness measure of LED brightness. eg: 255
         */
        //% blockId="neopixel_set_brightness" block="%strip|set brightness %brightness" blockGap=8
        //% weight=59
        //% parts="neopixel"
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /** * Create a range of LEDs.
         */
        //% weight=89
        //% blockId="neopixel_range" block="%strip|range from %start|with %length|leds"
        //% parts="neopixel"
        //% blockSetVariable=range
        range(start: number, length: number): Strip {
            start = start >> 0;
            length = length >> 0;
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            strip._mode = this._mode;
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         */
        //% blockId="neopixel_shift" block="%strip|shift pixels by %offset" blockGap=8
        //% weight=40
        //% parts="neopixel"
        shift(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate LEDs forward.
         */
        //% blockId="neopixel_rotate" block="%strip|rotate pixels by %offset" blockGap=8
        //% weight=39
        //% parts="neopixel"
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === NeoPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0 || pixeloffset >= this._length) return;

            let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }

        private setPixelW(pixeloffset: number, white: number): void {
            if (this._mode !== NeoPixelMode.RGBW || pixeloffset < 0 || pixeloffset >= this._length) return;

            pixeloffset = (pixeloffset + this.start) * 4;
            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            this.buf[pixeloffset + 3] = white;
        }
    }

    /**
     * Create a new NeoPixel driver.
     * @param pin the pin where the neopixel is connected. Defaults to P16.
     * @param numleds number of leds in the strip, eg: 3
     */
    //% blockId="neopixel_create" block="NeoPixel at pin %pin|with %numleds|leds as %mode"
    //% weight=90 blockGap=8
    //% parts="neopixel"
    //% trackArgs=0,2
    //% blockSetVariable=strip
    //% pin.defl=DigitalPin.P16
    export function create(pin: DigitalPin = DigitalPin.P16, numleds: number, mode: NeoPixelMode): Strip {
        let strip = new Strip();
        let stride = mode === NeoPixelMode.RGBW ? 4 : 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip._mode = mode;
        strip.setBrightness(255)
        strip.pin = pin;
        return strip;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     */
    //% weight=1
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    //% advanced=true
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    //% advanced=true
    export function colors(color: NeoPixelColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number { return (rgb >> 16) & 0xFF; }
    function unpackG(rgb: number): number { return (rgb >> 8) & 0xFF; }
    function unpackB(rgb: number): number { return (rgb) & 0xFF; }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     */
    //% blockId=neopixelHSL block="hue %h|saturation %s|luminosity %l"
    //% advanced=true
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h) % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000);
        let h1 = Math.idiv(h, 60);
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;
        let r$: number, g$: number, b$: number;
        if (h1 == 0) { r$ = c; g$ = x; b$ = 0; }
        else if (h1 == 1) { r$ = x; g$ = c; b$ = 0; }
        else if (h1 == 2) { r$ = 0; g$ = c; b$ = x; }
        else if (h1 == 3) { r$ = 0; g$ = x; b$ = c; }
        else if (h1 == 4) { r$ = x; g$ = 0; b$ = c; }
        else { r$ = c; g$ = 0; b$ = x; }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        return packRGB(r$ + m, g$ + m, b$ + m);
    }
}
