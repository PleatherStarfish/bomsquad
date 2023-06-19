from django.urls import path

# User-related views
from api.views import (
    delete_user,
    get_user_me,
)

# User modules-related views
from api.views import (
    UserModulesView,
    ModuleDetailView,
)

# Module and components-related views
from api.views import (
    get_module_bom_list_items,
    ComponentView,
    get_components_by_ids,
)

# User inventory-related views
from api.views import (
    get_user_inventory,
    user_inventory_update,
    user_inventory_delete,
    get_user_inventory_quantity,
    user_inventory_quantity_create_or_update,
    get_user_inventory_quantities_for_bom_list_item,
)

# User shopping list-related views
from api.views import (
    get_user_shopping_list,
    user_shopping_list_update,
    user_shopping_list_create_or_update,
    user_shopping_list_delete_module,
    user_shopping_list_delete_anonymous,
    get_user_shopping_list_quantity_bom_item_agnostic,
    get_user_shopping_list_quantity,
    add_all_user_shopping_list_to_inventory,
    get_user_shopping_list_total_price,
    get_user_shopping_list_total_component_price,
    get_user_shopping_list_total_quantity,
    archive_shopping_list,
    get_archived_shopping_lists,
    delete_archived_shopping_list,
    add_archived_list_to_current_list,
)

# User anonymous shopping list-related views
from api.views import (
    user_anonymous_shopping_list_create_or_update,
    get_user_anonymous_shopping_list_quantity,
)

# User history-related view
from api.views import (
    get_user_history,
)


urlpatterns = [
    path("get-user-me/", get_user_me, name="user-me"),
    path("get-user-history/", get_user_history, name="user-history"),
    path("delete-user-me/", delete_user, name="delete-user"),
    path("modules/<str:type>/", UserModulesView.as_view(), name="user-modules"),
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
    path(
        "inventory/<int:component_pk>/create-or-update/",
        user_inventory_quantity_create_or_update,
        name="user_inventory_create_or_update",
    ),
    path(
        "inventory/<int:component_pk>/update/",
        user_inventory_update,
        name="user_inventory_update",
    ),
    path(
        "inventory/<int:component_pk>/delete/",
        user_inventory_delete,
        name="user_inventory_delete",
    ),
    path("shopping-list/", get_user_shopping_list, name="user-shopping-list"),
    path(
        "shopping-list/<int:component_pk>/update/",
        user_shopping_list_update,
        name="user-shopping-list-update",
    ),
    path(
        "shopping-list/<int:module_pk>/delete/",
        user_shopping_list_delete_module,
        name="user-shopping-list-delete-module",
    ),
    path(
        "shopping-list/delete-anonymous/",
        user_shopping_list_delete_anonymous,
        name="user-shopping-list-delete-module",
    ),
    path(
        "shopping-list/<int:component_pk>/create-or-update/",
        user_shopping_list_create_or_update,
        name="user-shopping-list-create-or-update",
    ),
    path(
        "shopping-list/<int:component_pk>/anonymous-create-or-update/",
        user_anonymous_shopping_list_create_or_update,
        name="user-anonymous-shopping-list-create-or-update",
    ),
    path(
        "shopping-list/<int:component_pk>/component-quantity/",
        get_user_anonymous_shopping_list_quantity,
        name="user-shopping-list-anonymous",
    ),
    path(
        "shopping-list/<int:component_pk>/<int:module_pk>/component-quantity/",
        get_user_shopping_list_quantity_bom_item_agnostic,
        name="user-shopping-list-bom-item-agnostic",
    ),
    path(
        "shopping-list/<int:component_pk>/<int:modulebomlistitem_pk>/<int:module_pk>/component-quantity/",
        get_user_shopping_list_quantity,
        name="user-shopping-list",
    ),
    path(
        "shopping-list/total-price/",
        get_user_shopping_list_total_price,
        name="user-shopping-list-total-price",
    ),
    path(
        "shopping-list/<int:component_pk>/total-price/",
        get_user_shopping_list_total_component_price,
        name="user-shopping-list-total-price",
    ),
    path(
        "shopping-list/total-quantity/",
        get_user_shopping_list_total_quantity,
        name="user-shopping-list-quantity",
    ),
    path("shopping-list/archive/", archive_shopping_list, name="archive-shopping-list"),
    path(
        "shopping-list/archive/add/",
        add_archived_list_to_current_list,
        name="add-archived-list-to-current-list",
    ),
    path(
        "shopping-list/get-archived/",
        get_archived_shopping_lists,
        name="get-archived-shopping-lists",
    ),
    path(
        "shopping-list/delete/<str:timestamp>/",
        delete_archived_shopping_list,
        name="delete-shopping-list",
    ),
    path("components/", ComponentView.as_view(), name="component-list"),
    path("components/<str:pks>/", get_components_by_ids, name="component-list-by-ids"),
    path("module/<slug:slug>/", ModuleDetailView.as_view(), name="module-detail"),
    path(
        "module/<int:module_pk>/bom-list-items/",
        get_module_bom_list_items,
        name="module-bom-list-items",
    ),
    path(
        "shopping-list/inventory/add/",
        add_all_user_shopping_list_to_inventory,
        name="add_all_user_shopping_list_to_inventory",
    ),
]
