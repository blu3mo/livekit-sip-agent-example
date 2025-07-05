import os
import sys
from dotenv import load_dotenv

# .envファイルを読み込み、既存の環境変数を上書きする
# この行をコードのできるだけ早い段階で呼び出します
load_dotenv(override=True)


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


def get_optional_env(key: str, default: str = None) -> str:
    """オプションの環境変数を取得する"""
    return os.environ.get(key, default)