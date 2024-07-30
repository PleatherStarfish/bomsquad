from storages.backends.s3boto3 import S3Boto3Storage
import os


class StaticStorage(S3Boto3Storage):
    location = "static"
    bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME")
    custom_domain = f"{bucket_name}.digitaloceanspaces.com"
    region_name = os.environ.get("AWS_S3_REGION_NAME")
    file_overwrite = False


class MediaStorage(S3Boto3Storage):
    location = "media"
    bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME")
    custom_domain = f"{bucket_name}.digitaloceanspaces.com"
    region_name = os.environ.get("AWS_S3_REGION_NAME")
    file_overwrite = False
