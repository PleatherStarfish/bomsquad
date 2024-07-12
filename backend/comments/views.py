from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponseForbidden
from django_comments_xtd.models import XtdComment
from .models import CustomXtdComment
from django.contrib.auth.decorators import login_required
from django import forms
from django.core.paginator import Paginator


def latest_comments(request):
    comments = (
        XtdComment.objects.all()
        .select_related("customxtdcomment")
        .order_by("-submit_date")
    )
    paginator = Paginator(comments, 10)  # 10 comments per page
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return render(request, "pages/latest_comments.html", {"page_obj": page_obj})

    return render(request, "pages/latest_comments.html", {"page_obj": page_obj})


class CustomXtdCommentForm(forms.ModelForm):
    class Meta:
        model = XtdComment
        fields = ["comment", "followup"]
        widgets = {
            "comment": forms.Textarea(attrs={"rows": 4, "cols": 40}),
            "followup": forms.CheckboxInput(),
        }

    def __init__(self, target_object, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.target_object = target_object


@login_required
def edit_comment(request, comment_id):
    comment = get_object_or_404(XtdComment, id=comment_id)

    if request.user != comment.user:
        return HttpResponseForbidden()

    if request.method == "POST":
        form = CustomXtdCommentForm(
            comment.content_object, data=request.POST, instance=comment
        )
        if form.is_valid():
            form.save()
            return redirect(comment.content_object.get_absolute_url())
        else:
            print("Form errors:", form.errors)
    else:
        form = CustomXtdCommentForm(comment.content_object, instance=comment)

    return render(
        request, "comments/edit_comment.html", {"form": form, "comment": comment}
    )


@login_required
def delete_comment(request, comment_id):
    comment = get_object_or_404(XtdComment, id=comment_id)

    if request.user != comment.user:
        return HttpResponseForbidden()

    if request.method == "POST":
        comment.is_removed = True
        comment.save()
        return redirect(comment.content_object.get_absolute_url())

    return render(request, "comments/confirm_delete.html", {"comment": comment})
