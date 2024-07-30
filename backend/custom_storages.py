from storages.backends.s3boto3 import S3Boto3Storage
import os


class StaticStorage(S3Boto3Storage):
    location = "static"
    bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME", "nyc3")


class MediaStorage(S3Boto3Storage):
    location = "media"
    bucket_name = os.environ.get("AWS_STORAGE_BUCKET_NAME", "nyc3")
    file_overwrite = False
