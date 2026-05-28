from passlib.context import CryptContext


class PasswordManager:
    def __init__(self):
        self._pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.requirements = [
            "Use at least 8 characters",
            "Include at least one uppercase letter",
            "Include at least one lowercase letter",
            "Include at least one number",
        ]

    def hash_password(self, password: str) -> str:
        return self._pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self._pwd_context.verify(plain_password, hashed_password)

    def get_failed_requirements(self, password: str) -> list[str]:
        failed = []

        if len(password) < 8:
            failed.append(self.requirements[0])
        if not any(char.isupper() for char in password):
            failed.append(self.requirements[1])
        if not any(char.islower() for char in password):
            failed.append(self.requirements[2])
        if not any(char.isdigit() for char in password):
            failed.append(self.requirements[3])

        return failed

    def is_strong_enough(self, password: str) -> bool:
        return not self.get_failed_requirements(password)

    def build_validation_error(self, password: str) -> dict | None:
        failed_requirements = self.get_failed_requirements(password)
        if not failed_requirements:
            return None

        return {
            "message": "Password is not strong enough",
            "requirements": self.requirements,
            "failed_requirements": failed_requirements,
        }


password_manager = PasswordManager()
