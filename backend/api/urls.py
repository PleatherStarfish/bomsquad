from django.urls import path
from api.views import (
    ModuleDetailView,
    get_user_inventory,
    get_user_me,
    get_built_modules,
    get_wtb_modules,
)

urlpatterns = [
    path("get-user-me/", get_user_me),
    path("get-built-modules/", get_built_modules, name="get-built-modules"),
    path("get-wtb-modules/", get_wtb_modules, name="get-built-modules"),
    path("inventory/", get_user_inventory, name="user-inventory"),
    path("module/<slug:slug>/", ModuleDetailView.as_view(), name="module-detail"),
]
