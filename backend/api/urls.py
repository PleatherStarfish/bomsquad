from django.urls import path
from api.views import (
    ModuleDetailView,
    get_user_inventory,
    get_user_me,
    get_built_modules,
    get_wtb_modules,
    get_module_bom_list_items,
    get_components,
    get_user_inventory_quantity,
    get_user_shopping_list,
    get_user_shopping_list_quantity,
    get_user_inventory_quantities_for_bom_list_item,
)

urlpatterns = [
    path("get-user-me/", get_user_me),
    path("get-built-modules/", get_built_modules, name="get-built-modules"),
    path("get-wtb-modules/", get_wtb_modules, name="get-built-modules"),
    path("inventory/", get_user_inventory, name="user-inventory"),
    path(
        "inventory/bom-list-item/<int:modulebomlistitem_pk>/aggregate-sum/",
        get_user_inventory_quantities_for_bom_list_item,
        name="user-inventory-quantities-for-bom-list-item",
    ),
    path(
        "inventory/<int:component_pk>/component-quantity/",
        get_user_inventory_quantity,
        name="user-inventory-quantity",
    ),
    path("shopping_list/", get_user_shopping_list, name="user-shopping-list"),
    path(
        "shopping_list/<int:component_pk>/<int:modulebomlistitem_pk>/<int:module_pk>/component-quantity/",
        get_user_shopping_list_quantity,
        name="user-shopping-list",
    ),
    path("components/<str:pks>/", get_components, name="component-list"),
    path("module/<slug:slug>/", ModuleDetailView.as_view(), name="module-detail"),
    path(
        "module/<int:module_pk>/bom-list-items/",
        get_module_bom_list_items,
        name="module-bom-list-items",
    ),
]
