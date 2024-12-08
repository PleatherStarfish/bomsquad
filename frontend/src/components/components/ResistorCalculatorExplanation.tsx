import React from 'react';

const ResistorCalculatorExplanation: React.FC = () => {
  return (
    <div className="max-w-4xl py-6 mx-auto mt-10 space-y-6 bg-white rounded-lg">
      <h1 className="text-3xl font-semibold text-center font-display">Understanding LED Circuit Terms</h1>
      <p className="text-gray-700">
        If you&apos;re new to working with LEDs and electronic components on websites like <strong>Mouser</strong> or <strong>DigiKey</strong>, terms like <strong>Supply Voltage</strong>, <strong>Forward Voltage</strong>, and <strong>Forward Current</strong> might seem confusing at first. Let’s break them down to help you understand how these concepts work together in an LED circuit.
      </p>

      <section>
        <h2 className="mb-3 text-xl font-semibold">What is Supply Voltage (\( Vsupply \))?</h2>
        <p className="text-gray-700">
          The <strong>Supply Voltage</strong> is the voltage provided by your power source, such as a battery, USB port, or power adapter. It’s the &quot;push&quot; that drives electrical current through your circuit. For example:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li>A typical USB port provides 5 volts (V).</li>
          <li>A household AA battery provides 1.5 volts.</li>
        </ul>
        <p className="text-gray-700">
          When designing an LED circuit, knowing the supply voltage is critical because it determines how much voltage will be available to &quot;share&quot; between the LED and the resistor. Too high a supply voltage can damage your components, while too low might not power the LED properly.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">What is Forward Voltage (\( V_f \))?</h2>
        <p className="text-gray-700">
          The <strong>Forward Voltage</strong> of an LED is the minimum voltage required to make the LED light up. Every LED has a specific forward voltage, which depends on its type and color:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li>Red LEDs typically have a forward voltage of 1.8–2.2 volts.</li>
          <li>Green LEDs might have a forward voltage of 2.0–3.0 volts.</li>
          <li>Blue and white LEDs often have a forward voltage of 3.0–3.5 volts.</li>
        </ul>
        <p className="text-gray-700">
          When you check the datasheet for an LED on Mouser or DigiKey, you&apos;ll often see the forward voltage listed as a range. This is normal because the exact value can vary slightly between individual LEDs of the same type.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">What is Forward Current (\( I_f \))?</h2>
        <p className="text-gray-700">
          The <strong>Forward Current</strong> is the amount of electrical current that flows through the LED when it is on. It’s usually measured in milliamps (mA). Most LEDs are designed to operate at a specific forward current:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li>Standard LEDs typically operate at <strong>20 mA</strong> (0.02 amps).</li>
          <li>Some low-power LEDs might work at just <strong>5 mA</strong> (0.005 amps).</li>
          <li>High-power LEDs can require <strong>hundreds of milliamps or more</strong>.</li>
        </ul>
        <p className="text-gray-700">
          Running too much current through an LED can cause it to overheat and fail, while too little current might result in dim light or no illumination at all.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Why Do I Need a Resistor?</h2>
        <p className="text-gray-700">
          LEDs are not like traditional light bulbs. They don’t limit their own current, so they rely on a resistor to control the amount of current flowing through them. Without a resistor, the LED can draw too much current, become too hot, and burn out.
        </p>
        <p className="text-gray-700">
          The resistor acts like a &quot;traffic cop,&quot; ensuring only the right amount of current flows. The resistor value (\( R_L \)) is calculated using this formula:
        </p>
        <br/>
        <pre className="p-4 text-gray-700 bg-gray-100 rounded">
          R<sub>L</sub> = (V<sub>supply</sub> - V<sub>f</sub>) / I<sub>f</sub>
        </pre>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">How to Read Datasheets on Mouser or DigiKey</h2>
        <p className="text-gray-700">
          When browsing websites like Mouser or DigiKey for components, you’ll see terms like &quot;forward voltage,&quot; &quot;forward current,&quot; and &quot;maximum ratings&quot; in the LED&apos;s specifications. Here’s how to interpret them:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li>
            <b>Forward Voltage (\( V_f \)):</b> Look for this value in the <em>Electrical Characteristics</em> section. It’s usually listed as a range (e.g., 1.8V–2.2V for red LEDs).
          </li>
          <li>
            <b>Forward Current (\( I_f \)):</b> Find this in the same section, often labeled as &quot;Typical Forward Current&quot; or &quot;Maximum Forward Current.&quot;
          </li>
          <li>
            <b>Maximum Ratings:</b> This section tells you the limits for current and voltage. Exceeding these can damage the LED permanently.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Example: Calculating Resistor Value for a Red LED</h2>
        <p className="text-gray-700">
          Imagine you’re building a circuit with the following:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li><strong>Supply Voltage (\( Vsupply \)):</strong> 5V (from a USB power source)</li>
          <li><strong>Forward Voltage (\( V_f \)):</strong> 2.0V (red LED)</li>
          <li><strong>Forward Current (\( I_f \)):</strong> 20 mA (0.02 A)</li>
        </ul>
        <p className="text-gray-700">
          Using the formula:
        </p>
        <pre className="p-4 text-gray-700 bg-gray-100 rounded">
          R<sub>L</sub> = (5 - 2.0) / 0.02 = 150 Ω
        </pre>
        <p className="text-gray-700">
          You’d need a resistor with a value of <strong>150 ohms</strong>. On DigiKey, search for a resistor with:
        </p>
        <ul className="text-gray-700 list-disc list-inside">
          <li>Resistance: 150 ohms</li>
          <li>Power rating: At least 0.25 watts (choose slightly higher for safety).</li>
        </ul>
      </section>
    </div>
  );
};

export default ResistorCalculatorExplanation;
