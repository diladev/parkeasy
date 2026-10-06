import 'package:equatable/equatable.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

abstract class ProfileEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

/// Show the saved user right away, then load the latest from the API.
class ProfileRequested extends ProfileEvent {}

/// The user was changed on another screen (e.g. Edit profile succeeded).
class ProfileUserChanged extends ProfileEvent {
  final User user;

  ProfileUserChanged(this.user);

  @override
  List<Object?> get props => [user];
}

/// Signed out: forget the user.
class ProfileCleared extends ProfileEvent {}
