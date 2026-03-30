// Initialise strip on P16 with 4 pixels (standard for many Yahboom cars)
let strip = yahboom_lights.create(DigitalPin.P16, 4, NeoPixelMode.RGB)

// Test basic colors
strip.showColor(NeoPixelColors.Red)
basic.pause(500)
strip.clear()

// Test individual pixel control
strip.setPixelColor(0, NeoPixelColors.Blue)
strip.setPixelColor(1, NeoPixelColors.Green)
strip.show()
