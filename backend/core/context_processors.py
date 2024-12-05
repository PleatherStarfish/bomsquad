import os


def mixpanel_token(request):
    return {"mixpanel_token": os.getenv("MIXPANEL_TOKEN")}
