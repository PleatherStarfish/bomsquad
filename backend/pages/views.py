from django.views.generic import TemplateView, DetailView
from .models import StaticPage
from components.models import Component, ComponentSupplierItem
from django.shortcuts import render, get_object_or_404
from modules.models import ModuleBomListItem, Module


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class StaticPageDetailView(DetailView):
    model = StaticPage
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return StaticPage.objects.filter(title=self.page_title).first()


class AboutPageView(StaticPageDetailView):
    page_title = "About"


class DisclaimerPageView(StaticPageDetailView):
    page_title = "Disclaimer"


class TosView(StaticPageDetailView):
    page_title = "Terms of Service"


class PrivacyPolicyView(StaticPageDetailView):
    page_title = "Privacy Policy"


class FAQView(StaticPageDetailView):
    page_title = "FAQ"


def component_detail(request, component_id):
    # Fetch the component
    component = get_object_or_404(Component, id=component_id)
    print(component.octopart_url)

    # Fetch related modules
    module_items = ModuleBomListItem.objects.filter(components_options=component)
    modules = sorted(
        [
            {
                "module": item.module,
                "quantity": item.quantity,
                "slug": item.module.slug,
            }
            for item in module_items
        ],
        key=lambda x: x["module"].name,
    )

    # Fetch related supplier items
    supplier_items = ComponentSupplierItem.objects.filter(component=component)
    suppliers = [
        {
            "supplier": item.supplier.name,
            "supplier_item_no": item.supplier_item_no,
            "link": item.link,
            "unit_price": item.unit_price,
        }
        for item in supplier_items
    ]

    # Serialize category and size information
    category_data = (
        {
            "id": component.category.id,
            "name": component.category.name,
            "full_path": component.category.get_full_path(),
        }
        if component.category
        else None
    )
    size_data = (
        {
            "id": component.size.id,
            "name": component.size.name,
            "full_path": component.size.get_full_path(),
        }
        if component.size
        else None
    )

    # Determine if the component type is Resistor or Capacitor
    is_resistor = component.type.name == "Resistor"
    is_capacitor = component.type.name == "Capacitor"

    # Calculate unit conversions for resistors and capacitors
    conversions = {}
    if is_resistor and component.ohms is not None:
        ohms = float(component.ohms)
        conversions = {
            "ohms": f"{ohms:.2f} Ω",
            "kilohms": f"{ohms / 1000:.2f} kΩ",
            "megohms": f"{ohms / 1_000_000:.2f} MΩ",
        }
    elif is_capacitor and component.farads is not None:
        farads = float(component.farads)
        conversions = {
            "picofarads": f"{farads * 1_000_000_000:.2f} pF",
            "nanofarads": f"{farads * 1_000_000:.2f} nF",
            "microfarads": f"{farads * 1_000:.2f} μF",
        }

    # Determine if fallback content should be rendered
    use_fallback_content = (
        is_resistor or is_capacitor
    ) and not component.editor_content

    # Gather additional resistor and capacitor metadata
    additional_data = {
        "tolerance": component.tolerance if component.tolerance else None,
        "voltage_rating": (
            component.voltage_rating if component.voltage_rating else None
        ),
        "size": size_data["full_path"] if size_data else None,
    }

    return render(
        request,
        "pages/components/component_detail.html",
        {
            "component": component,
            "modules": modules,
            "suppliers": suppliers,
            "category": category_data,
            "size": size_data,
            "back_url": "/components/",
            "use_fallback_content": use_fallback_content,
            "conversions": conversions,  # Pass unit conversions
            "additional_data": additional_data,  # Pass extra metadata
        },
    )


def module_detail(request, slug):
    module = get_object_or_404(Module, slug=slug)
    return render(request, "frontend.html", {"module": module})
