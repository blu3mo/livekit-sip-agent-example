import os
import sys


def verify_env(keys: list[str]) -> dict[str, str]:
    """環境変数を検証し、必要な値が設定されているか確認する"""
    result = {}
    for key in keys:
        value = os.environ.get(key)
        if not value:
            print(f"Environment variable {key} is not set.", file=sys.stderr)
            sys.exit(1)
        result[key] = value
    return result