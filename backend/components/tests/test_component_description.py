from django.test import TestCase
from components.utils.generate_component_descriptions import (
    ComponentDescriptionGenerator,
)
from components.models import (
    Component,
    Types,
    Category,
    ComponentManufacturer,
    SizeStandard,
)


class TestComponentDescriptionGenerator(TestCase):
    """Unit tests for ComponentDescriptionGenerator using Django’s TestCase."""

    def setUp(self):
        # Pre-create common Types
        self.resistor_type = Types.objects.create(name="Resistor")
        self.capacitor_type = Types.objects.create(name="Capacitor")
        self.potentiometer_type = Types.objects.create(name="Potentiometer")
        self.led_type = Types.objects.create(name="Light-emitting diode (LED)")
        self.transistor_type = Types.objects.create(name="Transistor")
        self.power_connector_type = Types.objects.create(name="Power Connector")
        self.standoff_type = Types.objects.create(name="Standoff or Spacer")
        self.ic_type = Types.objects.create(name="Integrated Circuit (IC)")
        self.jack_type = Types.objects.create(name="Jack")

        # Pre-create common Categories
        self.resistors_cat = Category.objects.create(name="Resistors")
        self.resistor_cat = Category.objects.create(name="Resistor")
        self.capacitors_cat = Category.objects.create(name="Capacitors")
        self.capacitor_cat = Category.objects.create(name="Capacitor")
        self.potentiometer_cat = Category.objects.create(name="Potentiometer")
        self.potentiometers_cat = Category.objects.create(name="Potentiometers")
        self.leds_cat = Category.objects.create(name="LEDs")
        self.transistors_cat = Category.objects.create(name="Transistors")
        self.power_connectors_cat = Category.objects.create(name="Power Connectors")
        self.standoffs_cat = Category.objects.create(name="Standoffs & Spacers")
        self.ic_cat = Category.objects.create(name="Integrated Circuit (IC)")
        self.jack_cat = Category.objects.create(name="Jack")

        # Pre-create common Manufacturers
        self.vishay = ComponentManufacturer.objects.create(name="Vishay")
        self.wurth = ComponentManufacturer.objects.create(name="Würth Elektronik")
        self.bourns = ComponentManufacturer.objects.create(name="Bourns")
        self.cree = ComponentManufacturer.objects.create(name="Cree")
        self.texas = ComponentManufacturer.objects.create(name="Texas Instruments")
        self.mouser = ComponentManufacturer.objects.create(name="Mouser")
        self.panasonic = ComponentManufacturer.objects.create(name="Panasonic")
        self.neutrik = ComponentManufacturer.objects.create(name="Neutrik")

        # Pre-create common SizeStandard
        self.size_m3 = SizeStandard.objects.create(name="M3")

    def run_test_case(self, component, expected_description):
        """
        Helper function to save the component (and its related fields)
        so that foreign keys are hydrated and then run the description generator.
        """
        # Saving the component will ensure all FK fields are properly populated.
        component.save()
        result = ComponentDescriptionGenerator.generate_description(component)
        self.assertEqual(
            result,
            expected_description,
            f"\nExpected: {expected_description}\nGot: {result}",
        )

    def test_resistors(self):
        """Test cases for resistors."""
        self.run_test_case(
            Component(
                type=self.resistor_type,
                category=self.resistors_cat,
                ohms=10,
                ohms_unit="kΩ",
                wattage="0.5W",
                tolerance="5%",
                manufacturer=self.vishay,
                manufacturer_part_no="ABC123",
            ),
            "10kΩ Resistor 0.5W 5% Tolerance by Vishay (Part No: ABC123)",
        )

        self.run_test_case(
            Component(
                type=self.resistor_type,
                category=self.resistor_cat,
                ohms=470,
                ohms_unit="Ω",
                wattage="1W",
                tolerance="10%",
            ),
            "470Ω Resistor 1W 10% Tolerance",
        )

        self.run_test_case(
            Component(
                type=self.resistor_type,
                category=self.resistors_cat,
                ohms=1,
                ohms_unit="MΩ",
            ),
            "1MΩ Resistor",
        )

    def test_capacitors(self):
        """Test cases for capacitors."""
        self.run_test_case(
            Component(
                type=self.capacitor_type,
                category=self.capacitors_cat,
                farads=1.0,
                farads_unit="uF",
                tolerance="20%",
                manufacturer=self.wurth,
                manufacturer_part_no="860010672005",
            ),
            "1uF Capacitor 20% Tolerance by Würth Elektronik (Part No: 860010672005)",
        )

        self.run_test_case(
            Component(
                type=self.capacitor_type,
                category=self.capacitors_cat,
                farads=0.1,
                farads_unit="nF",
                tolerance="10%",
                manufacturer_part_no="123ABC",
            ),
            "0.1nF Capacitor 10% Tolerance (Part No: 123ABC)",
        )

        self.run_test_case(
            Component(
                type=self.capacitor_type,
                category=self.capacitor_cat,
                farads=100,
                farads_unit="pF",
                tolerance="5%",
            ),
            "100pF Capacitor 5% Tolerance",
        )

    def test_potentiometers(self):
        """Comprehensive test cases for potentiometers."""

        # Basic potentiometer with standard resistance and taper
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=250,
                ohms_unit="kΩ",
                pot_taper="Linear",
            ),
            "B250K Linear",
        )

        # Potentiometer with a smooth shaft and right-angle mount
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometers_cat,
                ohms=500,
                ohms_unit="Ω",
                pot_taper="Logarithmic",
                pot_shaft_type="Smooth",
                pot_angle_type="Right-Angle",
            ),
            "A500 Logarithmic Smooth Shaft Right-Angle Mount",
        )

        # Dual-gang potentiometer with plastic shaft and panel mount
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=1,
                ohms_unit="MΩ",
                pot_taper="Reverse Logarithmic",
                pot_shaft_material="Plastic",
                pot_gangs=2,
                pot_mounting_type="Panel Mount",
            ),
            "C1M Reverse Logarithmic Shaft Plastic Shaft Dual-gang Panel Mount",
        )

        # Potentiometer with a split shaft and PCB mount
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometers_cat,
                ohms=47000,
                ohms_unit="Ω",
                pot_taper="Linear",
                pot_shaft_type="Knurled",
                pot_shaft_material="Metal",
                pot_angle_type="Straight",
                pot_mounting_type="PCB Mount",
                pot_split_shaft=True,
            ),
            "B47K Straight Knurled Shaft Split Shaft with PCB Mount",
        )

        # Potentiometer with a specified shaft diameter and length
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=220000,
                ohms_unit="Ω",
                pot_taper="Logarithmic",
                pot_shaft_type="D-Shaft",
                pot_shaft_material="Metal",
                pot_shaft_diameter="6mm",
                pot_shaft_length="15mm",
            ),
            "A220K D-Shaft Shaft (6mm diameter, 15mm length)",
        )

        # Potentiometer with a base width and a right-angle long shaft
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometers_cat,
                ohms=5000,
                ohms_unit="Ω",
                pot_taper="Custom",
                pot_shaft_type="Smooth",
                pot_shaft_material="Metal",
                pot_angle_type="Right-Angle-Long",
                pot_base_width="9mm",
            ),
            "W5K Smooth Shaft Right-Angle-Long (9mm base)",
        )

        # Single-gang potentiometer with a knurled metal shaft and solder lug mounting
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=10000,
                ohms_unit="Ω",
                pot_taper="Linear",
                pot_shaft_type="Knurled",
                pot_shaft_material="Metal",
                pot_mounting_type="Solder Lug",
            ),
            "B10K Knurled Shaft with Solder Lug",
        )

        # Reverse logarithmic potentiometer with no specified shaft type
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=750000,
                ohms_unit="Ω",
                pot_taper="Reverse Logarithmic",
            ),
            "C750K Shaft",
        )

        # Potentiometer with all parameters set, including manufacturer
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometers_cat,
                ohms=20000,
                ohms_unit="Ω",
                pot_taper="Linear",
                pot_shaft_type="D-Shaft",
                pot_shaft_material="Plastic",
                pot_angle_type="Right-Angle",
                pot_gangs=3,
                pot_mounting_type="Panel Mount",
                pot_shaft_diameter="6mm",
                pot_shaft_length="18mm",
                manufacturer=self.bourns,
                manufacturer_part_no="POT20K",
            ),
            "B20K D-Shaft Plastic Shaft Right-Angle 3-gang with Panel Mount (6mm diameter, 18mm length) by Bourns (Part No: POT20K)",
        )

        # Edge case: Potentiometer with an unknown taper (should default to "B" for linear)
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=330000,
                ohms_unit="Ω",
                pot_taper=None,  # No taper provided
            ),
            "B330K Shaft",
        )

        # Edge case: Potentiometer with missing ohms unit (should still generate description)
        self.run_test_case(
            Component(
                type=self.potentiometer_type,
                category=self.potentiometer_cat,
                ohms=1000,
                pot_taper="Logarithmic",
            ),
            "A1000 Shaft",
        )

    def test_semiconductors(self):
        """Test cases for semiconductors like LEDs and transistors."""
        self.run_test_case(
            Component(
                type=self.led_type,
                category=self.leds_cat,
                wattage="0.2W",
                manufacturer=self.cree,
                manufacturer_part_no="LED123",
            ),
            "Light-emitting diode (LED) 0.2W by Cree (Part No: LED123)",
        )

        self.run_test_case(
            Component(
                type=self.transistor_type,
                category=self.transistors_cat,
                manufacturer=self.texas,
                manufacturer_part_no="TX12345",
            ),
            "Transistor by Texas Instruments (Part No: TX12345)",
        )

    def test_miscellaneous(self):
        """Test cases for general components."""
        self.run_test_case(
            Component(
                type=self.power_connector_type,
                category=self.power_connectors_cat,
                mounting_style="smt",
            ),
            "Power Connector (SMT)",
        )

        self.run_test_case(
            Component(
                type=self.standoff_type,
                category=self.standoffs_cat,
                size=self.size_m3,
            ),
            "Standoffs & Spacers M3",
        )

        self.run_test_case(
            Component(
                type=self.ic_type,
                category=self.ic_cat,
                manufacturer=self.mouser,
                manufacturer_part_no="IC123",
            ),
            "Integrated Circuit (IC) by Mouser (Part No: IC123)",
        )

    def test_edge_cases(self):

        self.run_test_case(
            Component(
                type=self.resistor_type,
                category=None,
                ohms=220,
                ohms_unit="Ω",
            ),
            "220Ω Resistor",
        )

        self.run_test_case(
            Component(
                type=self.capacitor_type,
                category=self.capacitor_cat,
                farads=0.47,
                farads_unit="uF",
            ),
            "0.47uF Capacitor",
        )

        self.run_test_case(
            Component(
                type=self.capacitor_type,
                category=self.capacitor_cat,
                farads=10,
                farads_unit="uF",
                manufacturer=self.panasonic,
                manufacturer_part_no="CAP123",
            ),
            "10uF Capacitor by Panasonic (Part No: CAP123)",
        )

        self.run_test_case(
            Component(
                type=self.jack_type,
                category=self.jack_cat,
                mounting_style="th",
                manufacturer=self.neutrik,
                manufacturer_part_no="JACK123",
            ),
            "Jack (Through Hole) by Neutrik (Part No: JACK123)",
        )


if __name__ == "__main__":
    import unittest

    unittest.main()
