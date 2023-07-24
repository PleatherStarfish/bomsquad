from django.urls import path

# User-related views
from accounts.views import (
    delete_user,
    get_user_me,
    get_user_history,
)

# User modules-related views
from modules.views import UserModulesView, ModuleDetailView, get_module_bom_list_items

# Module and components-related views
from components.views import (
    ComponentView,
    get_components_by_ids,
)

# User inventory-related views
from inventory.views import (
    UserInventoryView,
    get_user_inventory_quantity,
    get_user_inventory_quantities_for_bom_list_item,
)

# User shopping list-related views
from shopping_list.views import (
    UserShoppingListView,
    ArchivedShoppingListsView,
    UserAnonymousShoppingListView,
    get_user_shopping_list_quantity,
    add_component_to_inventory,
    add_all_user_shopping_list_to_inventory,
    get_user_shopping_list_total_price,
    get_user_shopping_list_total_component_price,
    get_user_shopping_list_total_quantity,
    archive_shopping_list,
    get_user_anonymous_shopping_list_quantity,
)


urlpatterns = [
    path("get-user-me/", get_user_me, name="user-me"),
    path("get-user-history/", get_user_history, name="user-history"),
    path("delete-user-me/", delete_user, name="delete-user"),
    path("modules/<str:type>/", UserModulesView.as_view(), name="user-modules"),
    path("inventory/", UserInventoryView.as_view(), name="user-inventory"),
    path(
        "inventory/bom-list-item/<int:modulebomlistitem_pk>/aggregate-sum/",
        get_user_inventory_quantities_for_bom_list_item,
        name="user-inventory-quantities-for-bom-list-item",
    ),
    path(
        "inventory/<uuid:component_pk>/component-quantity/",
        get_user_inventory_quantity,
        name="user-inventory-quantity",
    ),
    path(
        "inventory/<uuid:component_pk>/create-or-update/",
        UserInventoryView.as_view(),
        name="user_inventory_create_or_update",
    ),
    path(
        "inventory/<uuid:component_pk>/update/",
        UserInventoryView.as_view(),
        name="user_inventory_update",
    ),
    path(
        "inventory/<uuid:component_pk>/delete/",
        UserInventoryView.as_view(),
        name="user_inventory_delete",
    ),
    path("shopping-list/", UserShoppingListView.as_view(), name="user-shopping-list"),
    path(
        "shopping-list/<uuid:component_pk>/update/",
        UserShoppingListView.as_view(),
        name="user-shopping-list-update",
    ),
    path(
        "shopping-list/<uuid:module_pk>/delete/",
        UserShoppingListView.as_view(),
        name="user-shopping-list-delete-module",
    ),
    path(
        "shopping-list/delete-anonymous/",
        UserAnonymousShoppingListView.as_view(),
        name="user-shopping-list-delete-module",
    ),
    path(
        "shopping-list/<uuid:component_pk>/create-or-update/",
        UserShoppingListView.as_view(),
        name="user-shopping-list-create-or-update",
    ),
    path(
        "shopping-list/<uuid:component_pk>/anonymous-create-or-update/",
        UserAnonymousShoppingListView.as_view(),
        name="user-anonymous-shopping-list-create-or-update",
    ),
    path(
        "shopping-list/<uuid:component_pk>/component-quantity/",
        get_user_anonymous_shopping_list_quantity,
        name="user-shopping-list-anonymous",
    ),
    path(
        "shopping-list/<uuid:component_pk>/<uuid:modulebomlistitem_pk>/<uuid:module_pk>/component-quantity/",
        get_user_shopping_list_quantity,
        name="user-shopping-list",
    ),
    path(
        "shopping-list/total-price/",
        get_user_shopping_list_total_price,
        name="user-shopping-list-total-price",
    ),
    path(
        "shopping-list/<uuid:component_pk>/total-price/",
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
        ArchivedShoppingListsView.as_view(),
        name="add-archived-list-to-current-list",
    ),
    path(
        "shopping-list/get-archived/",
        ArchivedShoppingListsView.as_view(),
        name="get-archived-shopping-lists",
    ),
    path(
        "shopping-list/delete/<str:timestamp>/",
        ArchivedShoppingListsView.as_view(),
        name="delete-shopping-list",
    ),
    path("components/", ComponentView.as_view(), name="component-list"),
    path("components/<uuid:pks>/", get_components_by_ids, name="component-list-by-ids"),
    path("module/<slug:slug>/", ModuleDetailView.as_view(), name="module-detail"),
    path(
        "module/<uuid:module_pk>/bom-list-items/",
        get_module_bom_list_items,
        name="module-bom-list-items",
    ),
    path(
        "shopping-list/inventory/add/",
        add_all_user_shopping_list_to_inventory,
        name="add_all_user_shopping_list_to_inventory",
    ),
    path(
        "shopping-list/inventory/<uuid:component_pk>/add/",
        add_component_to_inventory,
        name="add_component_to_inventory",
    ),
]
