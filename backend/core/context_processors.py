import os
from uuid import UUID
from django.shortcuts import get_object_or_404
import html

from modules.models import ModuleBomListItem
from components.models import Component, ComponentSupplierItem


def mixpanel_token(request):
    return {"mixpanel_token": os.getenv("MIXPANEL_TOKEN")}


def meta_context(request):
    """
    Provide default meta data and allow path-based overrides.
    """
    META_DEFAULTS = {
        "title": "Build Your Own Synth | DIY Guitar Pedal | DIY Synth",
        "description": (
            "Build DIY guitar pedals, modular synth kits, and Eurorack projects with BOM Squad. "
            "Access schematics, inventory tools, and community reviews to streamline your builds."
        ),
        "keywords": "diy guitar pedals, diy synth, diy eurorack modules, diy audio, build your own synth",
        "image": "https://bom-squad.com/static/images/logo.png",
        "url": "https://bom-squad.com",
        "use_og": True,
        "og:type": "website",
        "og:site_name": "BOM Squad",
        "og:title": "Build Your Own Synth | DIY Guitar Pedal | DIY Synth",
        "og:description": (
            "Build DIY guitar pedals, modular synth kits, and Eurorack projects with BOM Squad. "
            "Access schematics, inventory tools, and community reviews to streamline your builds."
        ),
        "og:image": "https://bomsquad.com/static/images/logo.png",
        "og:url": "https://bom-squad.com",
    }

    # Define path-specific overrides
    PATH_META_OVERRIDES = {
        "/tools/resistor-calculator/": {
            "title": "LED Resistor Calculator | Calculate Resistor Values for LEDs",
            "description": (
                "Easily calculate resistor values for LEDs. Input Supply Voltage, Forward Voltage, "
                "and Current to get precise results for your electronics projects."
            ),
            "keywords": "LED Resistor Calculator, resistor calculator, LED circuit, calculate resistor, electronics projects",
            "og:type": "article",
            "og:title": "LED Resistor Calculator | Calculate Resistor Values for LEDs",
            "og:description": (
                "Easily calculate resistor values for LEDs. Input Supply Voltage, Forward Voltage, "
                "and Current to get precise results for your electronics projects."
            ),
            "og:url": "https://bom-squad.com/tools/resistor-calculator/",
        },
    }

    # Check if the current path matches a specific override
    current_path = request.path

    # Dynamic SEO for Component detail pages
    if current_path.startswith("/components/"):
        try:
            current_path_cleaned = current_path.rstrip("/")
            component_id = current_path_cleaned.split("/")[-1]
            UUID(component_id, version=4)
            component = get_object_or_404(Component, pk=component_id)

            # Find related ModuleBomListItems
            module_bom_items = ModuleBomListItem.objects.filter(
                components_options=component
            )

            # Gather related modules and manufacturers
            related_modules = list(
                module_bom_items.values_list("module__name", flat=True).distinct()
            )

            if related_modules:
                if len(related_modules) == 1:
                    related_modules_str = related_modules[0]
                else:
                    related_modules_str = ", ".join(related_modules[:-1])
                    related_modules_str += f", and {related_modules[-1]}"
            else:
                related_modules_str = ""

            MAX_TITLE_LENGTH = 60  # Define your maximum title length

            # Base title without modules
            base_title = f"{component.description} | Perfect for DIY audio projects"

            # Add related modules if they fit within the limit
            if related_modules_str:
                remaining_length = (
                    MAX_TITLE_LENGTH - len(base_title) - len(" such as ") - 3
                )  # Reserve space for "..." if truncated
                if remaining_length > 0:
                    # Truncate related modules list to fit within the limit
                    truncated_modules = (
                        (related_modules_str[:remaining_length] + "...")
                        if len(related_modules_str) > remaining_length
                        else related_modules_str
                    )
                    title = f"{base_title} such as {truncated_modules}"
                else:
                    title = base_title
            else:
                title = base_title

            related_manufacturers = module_bom_items.values_list(
                "module__manufacturer__name", flat=True
            ).distinct()

            # Gather related ComponentSupplierItems
            related_supplier_items = ComponentSupplierItem.objects.filter(
                component=component
            )

            # Generate a list of suppliers and their item numbers
            supplier_info = [
                f"{item.supplier.name} ({item.supplier_item_no})"
                for item in related_supplier_items
            ]

            MAX_DESCRIPTION_LENGTH = 160  # Maximum length for meta description

            # Dynamic description based on related modules
            if related_modules:
                # Construct a human-readable list of modules
                if len(related_modules) == 1:
                    related_modules_str = related_modules[0]
                else:
                    related_modules_str = ", ".join(related_modules[:-1])
                    related_modules_str += f", and {related_modules[-1]}"

                description_base = (
                    f"See how {component.manufacturer_part_no} from "
                    f"{component.manufacturer.name if component.manufacturer else 'various manufacturers'} "
                    f"is used in DIY modular synths and audio projects such as {related_modules_str}."
                )
            else:
                related_modules_str = ""
                description_base = (
                    f"Learn about {component.manufacturer_part_no} from "
                    f"{component.manufacturer.name if component.manufacturer else 'various manufacturers'}, "
                    f"perfect for DIY modular synths and audio projects."
                )

            # Truncate description to fit within the maximum length
            if len(description_base) > MAX_DESCRIPTION_LENGTH:
                description = description_base[: MAX_DESCRIPTION_LENGTH - 3] + "..."
            else:
                description = description_base

            # Generate meta tags
            META_DEFAULTS.update(
                {
                    "title": title,
                    "description": description,
                    "keywords": ", ".join(
                        filter(
                            None,
                            [
                                component.description,
                                (
                                    component.manufacturer.name
                                    if component.manufacturer
                                    else None
                                ),
                                *related_modules,
                                *related_manufacturers,
                            ],
                        )
                    ),
                    "og:type": "article",
                    "og:title": title,
                    "og:description": description,
                }
            )
        except (ValueError, IndexError):
            # Return default meta tags if there is an error
            return {"meta": META_DEFAULTS}

    specific_meta = PATH_META_OVERRIDES.get(current_path, {})

    # Merge defaults with specific overrides
    META_DEFAULTS.update(specific_meta)

    return {"meta": META_DEFAULTS}
