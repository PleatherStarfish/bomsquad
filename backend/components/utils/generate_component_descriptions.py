from django.core.exceptions import ObjectDoesNotExist


class ComponentDescriptionGenerator:
    """
    Generates a structured and logical description for electronic components.
    """

    TAPER_MAPPING = {
        "Linear": "B",
        "Logarithmic": "A",
        "Reverse Logarithmic": "C",
        "Custom": "W",
    }

    UNIT_CONVERSIONS = {
        "μF": "uF",
        "uF": "uF",
        "nF": "nF",
        "pF": "pF",
        "Ω": "Ω",
        "kΩ": "kΩ",
        "MΩ": "MΩ",
    }

    @classmethod
    def generate_description(cls, component):
        """Generates a structured and logical description for electronic components."""
        description_parts = []

        # Safely retrieve the component type.
        try:
            comp_type = component.type
        except:
            comp_type = ""

        if comp_type and comp_type.name == "Potentiometer":
            return cls._generate_potentiometer_description(component)

        # ✅ Resistors now use the **correct function**
        if getattr(component, "ohms", None) and getattr(component, "ohms_unit", None):
            description_parts.append(cls._format_resistor_ohms(component))
        elif getattr(component, "farads", None) and getattr(
            component, "farads_unit", None
        ):
            description_parts.append(cls._format_capacitance(component))

        cls._add_general_details(component, description_parts)

        return " ".join(description_parts).strip()

    @classmethod
    def _generate_potentiometer_description(cls, component):
        """Generates a clear, standardized description for potentiometers."""
        description_parts = []

        if component.ohms and component.ohms_unit and component.pot_taper:
            taper = cls.TAPER_MAPPING.get(component.pot_taper, "B")
            resistance = cls._format_potentiometer_ohms(component)
            description_parts.append(f"{taper}{resistance}")

        if component.pot_taper:
            description_parts.append(component.pot_taper)

        core_details = []

        if component.pot_split_shaft:
            core_details.append("Split")

        if component.pot_shaft_type:
            core_details.append(component.pot_shaft_type)

        if component.pot_shaft_type and "Shaft" not in core_details:
            core_details.append("Shaft")

        if component.pot_shaft_material and component.pot_shaft_material != "Metal":
            core_details.append(f"{component.pot_shaft_material} Shaft")

        if component.pot_angle_type:
            if "Mount" not in core_details:
                core_details.append(f"{component.pot_angle_type} Mount")
            else:
                core_details.append(component.pot_angle_type)

        if component.pot_gangs and component.pot_gangs > 1:
            gang_names = {1: "Single", 2: "Dual", 3: "Triple", 4: "Quad"}
            gang_label = gang_names.get(
                component.pot_gangs, f"{component.pot_gangs}-gang"
            )
            core_details.append(f"{gang_label}-gang")

        if component.pot_mounting_type:
            if "Mount" not in core_details:
                core_details.append(f"{component.pot_mounting_type} Mount")
            else:
                core_details.append(f"with {component.pot_mounting_type}")

        if core_details:
            description_parts.append(" ".join(core_details))

        size_details = []

        if component.pot_shaft_diameter:
            size_details.append(f"{component.pot_shaft_diameter} diameter")

        if component.pot_shaft_length:
            size_details.append(f"{component.pot_shaft_length} length")

        if component.pot_base_width:
            size_details.append(f"{component.pot_base_width} base")

        if size_details:
            description_parts.append(f"({' '.join(size_details)})")

        cls._add_general_details(component, description_parts)

        return " ".join(description_parts).strip()

    @classmethod
    def _format_resistor_ohms(cls, component):
        """Formats resistance values correctly for resistors, ensuring proper unit conversion."""
        ohms_value = component.ohms
        ohms_unit = component.ohms_unit

        # Convert whole floats to integers
        if isinstance(ohms_value, float) and ohms_value.is_integer():
            ohms_value = int(ohms_value)

        return f"{ohms_value}{ohms_unit}"

    @classmethod
    def _format_potentiometer_ohms(cls, component):
        """Formats resistance values correctly for potentiometers (abbreviated notation)."""
        ohms_value = component.ohms
        ohms_unit = component.ohms_unit  # ✅ Corrected from component.ohms

        # Convert whole floats to integers
        if isinstance(ohms_value, float) and ohms_value.is_integer():
            ohms_value = int(ohms_value)

        if ohms_unit == "Ω":
            value_str = f"{ohms_value}"
        elif ohms_unit == "kΩ":
            value_str = f"{ohms_value}K"
        elif ohms_unit == "MΩ":
            value_str = f"{ohms_value}M"
        else:
            value_str = f"{ohms_value}{ohms_unit}"  # Fallback

        return value_str

    @classmethod
    def _format_capacitance(cls, component):
        """Formats capacitance values consistently."""
        farads = component.farads
        if isinstance(farads, float):
            value = int(farads) if farads.is_integer() else farads
        else:
            value = farads
        unit = cls.UNIT_CONVERSIONS.get(component.farads_unit, component.farads_unit)
        return f"{value}{unit} Capacitor"

    @classmethod
    def _add_general_details(cls, component, description_parts):
        """Adds general component details like size, mounting style, wattage, tolerance, and manufacturer info."""
        # Only add the component type (or category) if it is not a potentiometer.
        if component.type and component.type.name not in [
            "Potentiometer",
            "Potentiometers",
        ]:
            chosen_name = None
            if component.type and component.category:
                if cls._is_redundant(component.category.name, component.type.name):
                    chosen_name = component.type.name
                else:
                    chosen_name = component.category.name
            elif component.type:
                chosen_name = component.type.name
            elif component.category:
                chosen_name = component.category.name

            if chosen_name:
                # Avoid duplicating if already present.
                if not (
                    description_parts and description_parts[0].endswith(chosen_name)
                ):
                    description_parts.append(chosen_name)

        if component.size:
            description_parts.append(component.size.name)

        if component.mounting_style:
            description_parts.append(
                "(Through Hole)"
                if component.mounting_style.lower() == "th"
                else "(SMT)"
            )

        if component.wattage:
            wattage = (
                f"{component.wattage}W"
                if not component.wattage.endswith("W")
                else component.wattage
            )
            description_parts.append(wattage)

        if component.tolerance:
            description_parts.append(f"{component.tolerance} Tolerance")

        if component.manufacturer and component.manufacturer_part_no:
            description_parts.append(
                f"by {component.manufacturer.name} (Part No: {component.manufacturer_part_no})"
            )
        elif component.manufacturer:
            description_parts.append(f"by {component.manufacturer.name}")
        elif component.manufacturer_part_no:
            description_parts.append(f"(Part No: {component.manufacturer_part_no})")

    @staticmethod
    def _is_redundant(term1, term2):
        """
        Checks if term1 and term2 are redundant, ensuring that we don't duplicate
        singular and plural forms or acronyms in parentheses (e.g., "LED" in "Light-emitting diode (LED)" vs. "LEDs").
        """
        if not term1 or not term2:
            return False

        def normalize(s):
            # Lowercase, remove surrounding whitespace and trailing plural endings
            return s.lower().strip().rstrip("s").rstrip("es")

        norm1 = normalize(term1)
        norm2 = normalize(term2)

        # Direct normalization comparison
        if norm1 == norm2:
            return True

        import re

        # Check if term1 contains an acronym in parentheses and compare it to term2
        match = re.search(r"\((.*?)\)", term1)
        if match:
            acronym = normalize(match.group(1))
            if acronym == norm2:
                return True

        # Check if term2 contains an acronym in parentheses and compare it to term1
        match = re.search(r"\((.*?)\)", term2)
        if match:
            acronym = normalize(match.group(1))
            if acronym == norm1:
                return True

        return False
