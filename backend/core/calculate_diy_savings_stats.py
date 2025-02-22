import statistics
from decimal import Decimal
from django.db.models import Sum, F, Avg
from modules.models import (
    Module,
    ModuleBomListItem,
)


def calculate_diy_savings_stats():
    """Calculate cost savings when building a DIY module compared to buying assembled, as a kit, or as a partial kit."""

    modules_with_costs = Module.objects.filter(
        cost_built__isnull=False, cost_built__gt=0
    ).values(
        "id",
        "cost_built",
        "cost_kit",
        "cost_partial_kit",
        "cost_pcb_only",
        "cost_pcb_plus_front",
    )

    cost_differences = {
        "pcb_only_vs_assembled": [],
        "pcb_plus_front_vs_assembled": [],
        "pcb_only_vs_kit": [],
        "pcb_plus_front_vs_kit": [],
        "pcb_only_vs_partial_kit": [],
        "pcb_plus_front_vs_partial_kit": [],
        "partial_kit_vs_assembled": [],
        "partial_kit_vs_full_kit": [],
    }

    for module in modules_with_costs:
        module_id = module["id"]
        cost_built = module["cost_built"] or Decimal("0")
        cost_kit = module["cost_kit"] or Decimal("0")
        cost_partial_kit = module["cost_partial_kit"] or Decimal("0")
        cost_pcb_only = module["cost_pcb_only"] or Decimal("0")
        cost_pcb_plus_front = module["cost_pcb_plus_front"] or Decimal("0")

        # Calculate DIY cost from BOM (typically representing the DIY kit build)
        bom_stats = (
            ModuleBomListItem.objects.filter(module_id=module_id)
            .annotate(
                diy_cost=Sum(
                    F("components_options__supplier_items__unit_price") * F("quantity")
                )
            )
            .aggregate(avg_diy=Avg("diy_cost"))
        )
        diy_cost = bom_stats["avg_diy"] or Decimal("0")
        if diy_cost == 0:
            continue  # Skip modules where DIY cost is missing

        # Comparisons to Assembled cost
        if cost_built > 0:
            if cost_pcb_only > 0:
                cost_differences["pcb_only_vs_assembled"].append(
                    float((cost_built - cost_pcb_only) / cost_built * 100)
                )
            if cost_pcb_plus_front > 0:
                cost_differences["pcb_plus_front_vs_assembled"].append(
                    float((cost_built - cost_pcb_plus_front) / cost_built * 100)
                )
            if cost_partial_kit > 0:
                cost_differences["partial_kit_vs_assembled"].append(
                    float((cost_built - cost_partial_kit) / cost_built * 100)
                )

        # Comparisons to Full Kit cost
        if cost_kit > 0:
            if cost_pcb_only > 0:
                cost_differences["pcb_only_vs_kit"].append(
                    float((cost_kit - cost_pcb_only) / cost_kit * 100)
                )
            if cost_pcb_plus_front > 0:
                cost_differences["pcb_plus_front_vs_kit"].append(
                    float((cost_kit - cost_pcb_plus_front) / cost_kit * 100)
                )
            if cost_partial_kit > 0:
                cost_differences["partial_kit_vs_full_kit"].append(
                    float((cost_kit - cost_partial_kit) / cost_kit * 100)
                )

        # Comparisons to Partial Kit cost
        if cost_partial_kit > 0:
            if cost_pcb_only > 0:
                cost_differences["pcb_only_vs_partial_kit"].append(
                    float((cost_partial_kit - cost_pcb_only) / cost_partial_kit * 100)
                )
            if cost_pcb_plus_front > 0:
                cost_differences["pcb_plus_front_vs_partial_kit"].append(
                    float(
                        (cost_partial_kit - cost_pcb_plus_front)
                        / cost_partial_kit
                        * 100
                    )
                )

    # Compute median and average savings safely
    def compute_stats(values):
        values = list(filter(None, values))  # Remove None values
        return {
            "average_savings": round(sum(values) / len(values), 2) if values else "N/A",
            "median_savings": round(statistics.median(values), 2) if values else "N/A",
        }

    return {
        "pcb_only_vs_assembled": compute_stats(
            cost_differences["pcb_only_vs_assembled"]
        ),
        "pcb_plus_front_vs_assembled": compute_stats(
            cost_differences["pcb_plus_front_vs_assembled"]
        ),
        "pcb_only_vs_kit": compute_stats(cost_differences["pcb_only_vs_kit"]),
        "pcb_plus_front_vs_kit": compute_stats(
            cost_differences["pcb_plus_front_vs_kit"]
        ),
        "pcb_only_vs_partial_kit": compute_stats(
            cost_differences["pcb_only_vs_partial_kit"]
        ),
        "pcb_plus_front_vs_partial_kit": compute_stats(
            cost_differences["pcb_plus_front_vs_partial_kit"]
        ),
        "partial_kit_vs_assembled": compute_stats(
            cost_differences["partial_kit_vs_assembled"]
        ),
        "partial_kit_vs_full_kit": compute_stats(
            cost_differences["partial_kit_vs_full_kit"]
        ),
    }
