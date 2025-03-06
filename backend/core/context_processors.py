import os
import re
from uuid import UUID
from django.shortcuts import get_object_or_404
import html

from blog.models import BlogPost
from modules.models import Module, ModuleBomListItem
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
        "ogtype": "website",
        "ogsite_name": "BOM Squad",
        "ogtitle": "Build Your Own Synth | DIY Guitar Pedal | DIY Synth",
        "ogdescription": (
            "Build DIY guitar pedals, modular synth kits, and Eurorack projects with BOM Squad. "
            "Access schematics, inventory tools, and community reviews to streamline your builds."
        ),
        "ogimage": "https://bomsquad.com/static/images/logo.png",
        "ogurl": "https://bom-squad.com",
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
            "ogtype": "article",
            "ogtitle": "LED Resistor Calculator | Calculate Resistor Values for LEDs",
            "ogdescription": (
                "Easily calculate resistor values for LEDs. Input Supply Voltage, Forward Voltage, "
                "and Current to get precise results for your electronics projects."
            ),
            "ogurl": "https://bom-squad.com/tools/resistor-calculator/",
        },
        "/privacy-policy/": {
            "title": "Privacy Policy | BOM Squad",
            "description": (
                "Read the BOM Squad Privacy Policy to learn how we handle your data, including information "
                "about cookies, data sharing, and your rights as a user."
            ),
            "schema_markup": {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Privacy Policy | BOM Squad",
                "description": "Learn how BOM Squad handles data privacy and user rights.",
                "url": "https://bom-squad.com/privacy-policy/",
            },
            "keywords": "privacy policy, BOM Squad privacy policy, data privacy, user rights, cookies policy",
            "ogtype": "website",
            "ogtitle": "Privacy Policy | BOM Squad",
            "ogdescription": (
                "Learn about BOM Squad's privacy practices, including data handling, cookies, and user rights."
            ),
            "ogurl": "https://bom-squad.com/privacy-policy/",
        },
        "/faq/": {
            "title": "FAQ | BOM Squad",
            "description": (
                "Find answers to frequently asked questions about BOM Squad, including using BOM tools, managing "
                "inventory, and building DIY guitar pedals and synth kits."
            ),
            "keywords": "FAQ, frequently asked questions, BOM Squad FAQ, DIY synth tools, DIY guitar pedal help",
            "ogtype": "website",
            "ogtitle": "FAQ | BOM Squad",
            "ogdescription": (
                "Get answers to common questions about BOM Squad's features, tools, and DIY audio projects."
            ),
            "ogurl": "https://bom-squad.com/faq/",
        },
        "/tos/": {
            "title": "Terms of Service | BOM Squad",
            "description": (
                "Review the Terms of Service for BOM Squad, detailing the rules and guidelines for using our platform "
                "and services, including user responsibilities and platform policies."
            ),
            "keywords": "terms of service, BOM Squad terms, user agreement, platform rules, user responsibilities",
            "ogtype": "website",
            "ogtitle": "Terms of Service | BOM Squad",
            "ogdescription": (
                "Understand the rules and guidelines for using BOM Squad. Read our Terms of Service, which outline "
                "user rights and platform policies."
            ),
            "ogurl": "https://bom-squad.com/tos/",
        },
        "/components/": {
            "title": "DIY Audio Components | Parts for Guitar Pedals and Synth Kits",
            "description": (
                "Discover high-quality components for DIY audio projects. From resistors and capacitors to rare ICs, "
                "find everything you need to build guitar pedals, modular synths, and Eurorack modules."
            ),
            "keywords": (
                "DIY audio components, guitar pedal parts, modular synth components, Eurorack parts, resistors, "
                "capacitors, ICs, DIY synth kits, build your own synth"
            ),
            "ogtype": "website",
            "ogtitle": "DIY Audio Components | Parts for Guitar Pedals and Synth Kits",
            "ogdescription": (
                "Find premium components for your DIY audio projects. Perfect for guitar pedals, synth kits, "
                "and modular Eurorack builds."
            ),
            "ogimage": "https://bom-squad.com/static/images/components-banner.png",
            "ogurl": "https://bom-squad.com/components/",
        },
        "/about/": {
            "title": "About BOM Squad | Easy DIY Synths and DIY Guitar Pedals",
            "description": (
                "Learn about BOM Squad, the ultimate platform for DIY audio enthusiasts. Discover how we help builders "
                "streamline their projects with tools, resources, and community support."
            ),
            "schema_markup": {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "BOM Squad",
                "url": "https://bom-squad.com",
                "logo": "https://bom-squad.com/static/images/logo.png",
                "description": (
                    "BOM Squad helps DIY audio enthusiasts streamline their projects with tools, resources, and community support."
                ),
            },
            "keywords": "about BOM Squad, DIY audio tools, DIY synth builders, guitar pedal resources, DIY community",
            "ogtype": "website",
            "ogtitle": "About BOM Squad | Empowering DIY Synth and Pedal Builders",
            "ogdescription": (
                "Explore the mission and vision behind BOM Squad. Discover how we're empowering the DIY audio "
                "community with tools, resources, and support."
            ),
            "ogimage": "https://bom-squad.com/static/images/about-banner.png",
            "ogurl": "https://bom-squad.com/about/",
        },
    }

    # Check if the current path matches a specific override
    current_path = request.path

    # Dynamic SEO for Project (Module) detail pages
    if current_path.startswith("/projects/"):
        try:
            # Extract the slug directly from the URL
            slug_match = re.match(r"^/projects/(?P<slug>[\w-]+)/?$", current_path)
            if not slug_match:
                raise ValueError("Invalid project slug format.")

            slug = slug_match.group("slug")

            # Retrieve the module
            module = get_object_or_404(Module, slug=slug)

            category = module.category or "audio"

            # Generate the title
            MAX_TITLE_LENGTH = 60
            base_title = f"{module.name} by {module.manufacturer.name} | DIY {module.category} Project"
            title = (
                base_title[: MAX_TITLE_LENGTH - 3] + "..."
                if len(base_title) > MAX_TITLE_LENGTH
                else base_title
            )

            # Generate the description
            MAX_DESCRIPTION_LENGTH = 160
            description_base = (
                f"Learn how to build {module.name} by {module.manufacturer.name}. "
                f"Get tutorials and components for {category} projects for DIY audio enthusiasts."
            )
            description = (
                description_base[: MAX_DESCRIPTION_LENGTH - 3] + "..."
                if len(description_base) > MAX_DESCRIPTION_LENGTH
                else description_base
            )

            schema_markup = {
                "@context": "https://schema.org",
                "@type": "Article",
                "name": module.name,
                "description": module.description or "DIY audio module project.",
                "brand": module.manufacturer.name,
                "url": f"https://bom-squad.com/projects/{slug}/",
                "image": "https://bom-squad.com/static/images/logo.png",
                "category": module.category or "Audio",
            }

            # Update meta tags
            META_DEFAULTS.update(
                {
                    "title": title,
                    "description": description,
                    "keywords": ", ".join(
                        filter(
                            None,
                            [
                                module.name,
                                f"build {module.name} {module.manufacturer.name}",
                                f"{category} DIY",
                                module.manufacturer.name,
                                "DIY synth",
                            ],
                        )
                    ),
                    "schema_markup": schema_markup,
                    "ogtype": "article",
                    "ogtitle": title,
                    "ogdescription": description,
                    "ogurl": f"https://bom-squad.com/projects/{slug}/",
                }
            )
        except (ValueError, Module.DoesNotExist):
            return {"meta": META_DEFAULTS}

    # Blog post detail pages at /blog/<slug>/
    if current_path.startswith("/blog/"):
        try:
            slug_match = re.match(r"^/blog/(?P<slug>[\w-]+)/?$", current_path)
            if not slug_match:
                raise ValueError("Invalid blog post slug format.")

            slug = slug_match.group("slug")
            blog_post = get_object_or_404(BlogPost, slug=slug)

            # Generate dynamic meta tags
            META_DEFAULTS.update(
                {
                    "title": blog_post.meta_title or blog_post.title,
                    "description": blog_post.meta_description
                    or blog_post.get_plain_text_excerpt(30),
                    "keywords": blog_post.meta_keywords,
                    "ogtype": "article",
                    "ogtitle": blog_post.meta_title or blog_post.title,
                    "ogdescription": blog_post.meta_description
                    or blog_post.get_plain_text_excerpt(30),
                    "ogimage": (
                        blog_post.featured_image.url
                        if blog_post.featured_image
                        else META_DEFAULTS["image"]
                    ),
                    "ogurl": f"https://bom-squad.com/blog/{slug}/",
                    "schema_markup": {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": blog_post.title,
                        "description": blog_post.meta_description
                        or blog_post.get_plain_text_excerpt(30),
                        "image": (
                            blog_post.featured_image.url
                            if blog_post.featured_image
                            else META_DEFAULTS["image"]
                        ),
                        "author": {
                            "@type": "Person",
                            "name": "BOM Squad",
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "BOM Squad",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://bom-squad.com/static/images/logo.png",
                            },
                        },
                        "datePublished": blog_post.datetime_created.isoformat(),
                        "dateModified": blog_post.datetime_updated.isoformat(),
                    },
                }
            )
        except (ValueError, BlogPost.DoesNotExist) as e:
            return {"meta": META_DEFAULTS}

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

            # Schema for Component detail pages
            schema_markup = {
                "@context": "https://schema.org",
                "@type": "Article",
                "name": component.description or "DIY Component",
                "description": f"Perfect for DIY audio projects such as guitar pedals and modular synths.",
                "brand": (
                    component.manufacturer.name if component.manufacturer else "Various"
                ),
                "url": f"https://bom-squad.com{current_path}",
                "image": "https://bom-squad.com/static/images/logo.png",
                "category": "DIY Components",
                "relatedModules": related_modules,  # Add related modules if any
                "relatedManufacturers": related_manufacturers,  # Add related manufacturers
            }

            # Generate meta tags
            META_DEFAULTS.update(
                {
                    "title": title,
                    "description": description,
                    "schema_markup": schema_markup,
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
                    "ogtype": "article",
                    "ogtitle": title,
                    "ogdescription": description,
                }
            )
        except (ValueError, IndexError):
            # Return default meta tags if there is an error
            return {"meta": META_DEFAULTS}

    specific_meta = PATH_META_OVERRIDES.get(current_path, {})

    # Merge defaults with specific overrides
    META_DEFAULTS.update(specific_meta)

    return {"meta": META_DEFAULTS}
