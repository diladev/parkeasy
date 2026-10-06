import 'package:equatable/equatable.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

enum ProfileStatus { initial, loading, loaded, failure }

/// One state class (instead of one class per state) so the user is never lost:
/// while the profile reloads, or when the reload fails, the screen keeps
/// showing the last known user.
class ProfileState extends Equatable {
  const ProfileState({
    this.status = ProfileStatus.initial,
    this.user,
    this.errorMessage,
  });

  final ProfileStatus status;
  final User? user;
  final String? errorMessage;

  ProfileState copyWith({
    ProfileStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return ProfileState(
      status: status ?? this.status,
      user: user ?? this.user,
      // Not carried over: an error only belongs to the state that reported it.
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, user, errorMessage];
}
