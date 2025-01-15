import os
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
            # Clean the current path to handle trailing slashes
            current_path_cleaned = current_path.rstrip("/")
            component_id = current_path_cleaned.split("/")[-1]

            # Retrieve the component object
            component = get_object_or_404(Component, pk=component_id)

            # Find related ModuleBomListItems
            module_bom_items = ModuleBomListItem.objects.filter(
                components_options=component
            )

            # Gather related modules and manufacturers
            related_modules = module_bom_items.values_list(
                "module__name", flat=True
            ).distinct()
            print(related_modules)
            print(len(related_modules))

            # Format the list into a human-readable string
            if len(related_modules) == 1:
                human_readable_modules = related_modules[0]
            elif len(related_modules) == 2:
                human_readable_modules = " and ".join(related_modules)
            else:
                human_readable_modules = (
                    ", ".join(related_modules[:-1]) + ", and " + related_modules[-1]
                )

            print(human_readable_modules)

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

            # Generate meta tags
            META_DEFAULTS.update(
                {
                    "title": (
                        f"{component.description} | Used in {', '.join(human_readable_modules)} "
                    ),
                    "description": (
                        f"Discover {component.description} from {component.manufacturer.name if component.manufacturer else 'various manufacturers'}, "
                        f"used in {', '.join(related_modules)} projects. Perfect for DIY modular synths and audio builds."
                    ),
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
                    "image": component.octopart_url
                    or "https://bomsquad.com/static/images/default-component.png",
                    "og:type": "article",
                    "og:title": f"{component.description} | Used in {', '.join(related_modules)}",
                    "og:description": (
                        f"Explore {component.description} from {component.manufacturer.name if component.manufacturer else 'various manufacturers'}, "
                        f"featured in {', '.join(related_modules)} projects. Supplier info: {', '.join(supplier_info)}"
                    ),
                }
            )
        except (ValueError, IndexError):
            # Return default meta tags if there is an error
            return {"meta": META_DEFAULTS}

    specific_meta = PATH_META_OVERRIDES.get(current_path, {})

    # Merge defaults with specific overrides
    META_DEFAULTS.update(specific_meta)

    return {"meta": META_DEFAULTS}
