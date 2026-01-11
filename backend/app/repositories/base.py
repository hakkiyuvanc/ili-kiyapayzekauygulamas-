"""Base Repository Interface"""

from abc import ABC, abstractmethod
from typing import Generic, Optional, TypeVar

from sqlalchemy.orm import Session

T = TypeVar("T")


class IRepository(ABC, Generic[T]):
    """
    Generic repository interface for data access operations.

    This interface defines the contract for all repository implementations,
    providing standard CRUD operations that can be easily mocked for testing.
    """

    def __init__(self, db: Session):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[T]:
        """
        Get entity by ID.

        Args:
            id: Entity ID

        Returns:
            Entity if found, None otherwise
        """
        pass

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        """
        Get all entities with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of entities
        """
        pass

    @abstractmethod
    def create(self, entity: T) -> T:
        """
        Create new entity.

        Args:
            entity: Entity to create

        Returns:
            Created entity with ID
        """
        pass

    @abstractmethod
    def update(self, entity: T) -> T:
        """
        Update existing entity.

        Args:
            entity: Entity to update

        Returns:
            Updated entity
        """
        pass

    @abstractmethod
    def delete(self, id: int) -> bool:
        """
        Delete entity by ID.

        Args:
            id: Entity ID

        Returns:
            True if deleted, False if not found
        """
        pass
