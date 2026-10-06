import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/profile/domain/usecases/get_profile.dart';
import 'profile_event.dart';
import 'profile_state.dart';

/// The signed-in user, shared by every screen that shows it.
/// Created once for the whole app (see main.dart).
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final GetProfile _getProfile;

  ProfileBloc(this._getProfile) : super(const ProfileState()) {
    on<ProfileRequested>(_onProfileRequested);
    on<ProfileUserChanged>(_onProfileUserChanged);
    on<ProfileCleared>(_onProfileCleared);
  }

  Future<void> _onProfileRequested(
    ProfileRequested event,
    Emitter<ProfileState> emit,
  ) async {
    // 1. The copy saved on the device: the screen fills in instantly.
    //    (The device copy first: it always belongs to the current session.)
    final cached = _getProfile.cached() ?? state.user;
    emit(ProfileState(status: ProfileStatus.loading, user: cached));

    // 2. The latest from the API.
    final result = await _getProfile();
    result.fold(
      (failure) => emit(
        state.copyWith(
          // With a saved copy the screen still works, so it isn't a failure.
          status: state.user == null ? ProfileStatus.failure : ProfileStatus.loaded,
          errorMessage: failure.message,
        ),
      ),
      (user) => emit(ProfileState(status: ProfileStatus.loaded, user: user)),
    );
  }

  void _onProfileUserChanged(
    ProfileUserChanged event,
    Emitter<ProfileState> emit,
  ) {
    emit(ProfileState(status: ProfileStatus.loaded, user: event.user));
  }

  void _onProfileCleared(ProfileCleared event, Emitter<ProfileState> emit) {
    emit(const ProfileState());
  }
}
