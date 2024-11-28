from django.urls import path

# User-related views
from accounts.views import (
    UserNotesView,
    UserCurrencyView,
    delete_user,
    get_user_me,
    get_user_history,
    kofi_payment_webhook,
    get_all_notes,
)

# User modules-related views
from modules.views import (
    UserModulesView,
    ModuleDetailView,
    get_module_bom_list_items,
    rate_component,
    get_average_rating,
    get_module_status,
    module_list_v2,
    get_filter_options,
    components_autocomplete,
)

# Module and components-related views
from components.views import (
    ComponentView,
    get_component_dropdowns,
    create_component,
    get_components_by_ids,
)

# User inventory-related views
from inventory.views import (
    UserInventoryView,
    get_user_inventory_quantity,
    get_user_inventory_quantities_for_bom_list_item,
    get_component_locations,
    get_components_locations,
    UserInventoryTreeView,
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
    get_all_unique_component_ids,
)

urlpatterns = [
    path("get-user-me/", get_user_me, name="user-me"),
    path("get-user-history/", get_user_history, name="user-history"),
    path("currency/", UserCurrencyView.as_view(), name="user_currency"),
    path("user-update-currency/", UserCurrencyView.as_view(), name="user_currency"),
    path("delete-user-me/", delete_user, name="delete-user"),
    path("kofi/", kofi_payment_webhook, name="kofi_webhook"),
    path("modules/<str:type>/", UserModulesView.as_view(), name="user-modules"),
    path("modules-infinite/", module_list_v2, name="module-list-v2"),
    path("filter-options/", get_filter_options, name="filter-options"),
    path(
        "components-autocomplete/",
        components_autocomplete,
        name="component-autocomplete",
    ),
    path(
        "module-status/<uuid:module_pk>/", get_module_status, name="get_module_status"
    ),
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
        "inventory/<uuid:inventory_pk>/update/",
        UserInventoryView.as_view(),
        name="user_inventory_update",
    ),
    path(
        "inventory/<uuid:inventory_pk>/delete/",
        UserInventoryView.as_view(),
        name="user_inventory_delete",
    ),
    path(
        "inventory/<uuid:component_pk>/locations/",
        get_component_locations,
        name="user_inventory_locations",
    ),
    path(
        "inventory/locations/",
        get_components_locations,
        name="user_inventory_locations_multiple",
    ),
    path(
        "inventory/tree/", UserInventoryTreeView.as_view(), name="user-inventory-tree"
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
    path(
        "shopping-list/unique-components/",
        get_all_unique_component_ids,
        name="unique-components",
    ),
    path("components/", ComponentView.as_view(), name="component-list"),
    path("components/options/", get_component_dropdowns, name="component-options"),
    path("components/create/", create_component, name="component-create"),
    path("components/<str:pks>/", get_components_by_ids, name="component-list-by-ids"),
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
    path("rate/", rate_component, name="rate-component"),
    path(
        "average-rating/<uuid:module_bom_list_item_id>/<uuid:component_id>/",
        get_average_rating,
        name="get-average-rating",
    ),
    path(
        "user-notes/<str:module_type>/<uuid:module_id>/",
        UserNotesView.as_view(),
        name="user-notes-list",
    ),
    path(
        "user-notes/<str:module_type>/",
        UserNotesView.as_view(),
        name="user-notes-create",
    ),
    path("user-notes/<str:module_type>/all/", get_all_notes, name="user-notes-all"),
    path("user-notes/<uuid:pk>/", UserNotesView.as_view(), name="user-notes-detail"),
]
